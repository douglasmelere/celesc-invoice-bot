import axios from "axios";
import { saveGeneratedPdf, getAllGeneratedPdfs } from "./db";

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const POLL_INTERVAL = 25000; // 25 seconds

interface SupabaseFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

/**
 * Background PDF poller that checks Supabase Storage for new PDFs every 25 seconds
 */
export function startPdfPoller() {
  // Validate environment variables
  if (!SUPABASE_STORAGE_URL || !SUPABASE_API_KEY) {
    console.warn("[PDF Poller] ⚠ Supabase credentials not configured. PDF polling disabled.");
    console.warn("[PDF Poller] Set SUPABASE_STORAGE_URL and SUPABASE_API_KEY to enable PDF polling.");
    return;
  }

  console.log("[PDF Poller] Starting Supabase Storage polling service");
  console.log(`[PDF Poller] Storage URL: ${SUPABASE_STORAGE_URL}`);
  
  // Run immediately on start
  pollForPdfs();
  
  // Then run every 25 seconds
  setInterval(pollForPdfs, POLL_INTERVAL);
}

async function pollForPdfs() {
  try {
    console.log("[PDF Poller] Checking Supabase Storage for new PDFs...");

    // Get existing PDFs from database to avoid duplicates
    const existingPdfs = await getAllGeneratedPdfs();
    const existingFilenames = new Set(existingPdfs.map(pdf => pdf.filename));
    console.log(`[PDF Poller] Found ${existingPdfs.length} existing PDF(s) in database`);

    // Fetch files from both folders
    const faturas = await listSupabaseFiles("faturas");
    const resumos = await listSupabaseFiles("resumos");

    let newFilesCount = 0;

    // Helper function to extract clean filename from path
    const getCleanFilename = (filePath: string): string => {
      return filePath.split('/').pop() || filePath;
    };

    // Process faturas
    for (const file of faturas) {
      const cleanName = getCleanFilename(file.name);
      if (!existingFilenames.has(cleanName)) {
        console.log(`[PDF Poller] New fatura found: ${cleanName}`);
        await downloadAndStorePdf(file, "fatura");
        newFilesCount++;
      } else {
        console.log(`[PDF Poller] Fatura already exists: ${cleanName}`);
      }
    }

    // Process resumos
    for (const file of resumos) {
      const cleanName = getCleanFilename(file.name);
      if (!existingFilenames.has(cleanName)) {
        console.log(`[PDF Poller] New resumo found: ${cleanName}`);
        await downloadAndStorePdf(file, "resumo");
        newFilesCount++;
      } else {
        console.log(`[PDF Poller] Resumo already exists: ${cleanName}`);
      }
    }

    if (newFilesCount > 0) {
      console.log(`[PDF Poller] ✓ Found and stored ${newFilesCount} new PDF(s)`);
    } else {
      console.log(`[PDF Poller] No new PDFs found (checked ${faturas.length} faturas, ${resumos.length} resumos)`);
    }
  } catch (error: any) {
    console.error("[PDF Poller] Error polling for PDFs:", error.message);
    if (error.stack) {
      console.error("[PDF Poller] Stack trace:", error.stack);
    }
  }
}

async function listSupabaseFiles(folder: string): Promise<SupabaseFile[]> {
  if (!SUPABASE_STORAGE_URL || !SUPABASE_API_KEY) {
    console.warn("[PDF Poller] Cannot list files: Supabase credentials not configured");
    return [];
  }

  try {
    const response = await axios.post(
      `${SUPABASE_STORAGE_URL}/object/list/celesc-faturas`,
      {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
        prefix: folder,
      },
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
        timeout: 10000,
      }
    );

    // Filter out the folder itself and return files
    const files = response.data.filter((file: SupabaseFile) => {
      // Exclude the folder entry itself and ensure it's a file
      return file.name && file.name !== folder && file.name.endsWith('.pdf');
    });
    
    console.log(`[PDF Poller] Found ${files.length} PDF(s) in ${folder} folder`);
    return files;
  } catch (error: any) {
    console.error(`[PDF Poller] Error listing files from ${folder}:`, error.message);
    return [];
  }
}

async function downloadAndStorePdf(file: SupabaseFile, type: "fatura" | "resumo") {
  if (!SUPABASE_STORAGE_URL || !SUPABASE_API_KEY) {
    console.warn("[PDF Poller] Cannot download file: Supabase credentials not configured");
    return;
  }

  try {
    // Construct public URL for the file
    // The file.name from the API might include the folder prefix or not
    // We need to construct the correct path for the public URL
    let filePath = file.name;
    
    // If the name doesn't include the folder, add it
    if (!filePath.includes('/')) {
      filePath = `${type}s/${filePath}`;
    }
    
    // Construct public URL - Supabase public URLs format:
    // /storage/v1/object/public/{bucket}/{folder}/{filename}
    // We need to encode each segment separately, not the whole path
    const pathSegments = filePath.split('/');
    const encodedSegments = pathSegments.map(segment => encodeURIComponent(segment));
    const encodedPath = encodedSegments.join('/');
    const publicUrl = `${SUPABASE_STORAGE_URL}/object/public/celesc-faturas/${encodedPath}`;
    
    console.log(`[PDF Poller] File path: ${filePath}`);
    console.log(`[PDF Poller] Encoded path: ${encodedPath}`);
    console.log(`[PDF Poller] Public URL: ${publicUrl}`);

    console.log(`[PDF Poller] Processing ${type}: ${file.name}`);

    // Extract clean filename
    const cleanFilename = file.name.split('/').pop() || `${type}_${Date.now()}.pdf`;
    
    // Use the Supabase path as the storage key (no need to re-upload)
    const s3Key = filePath; // Use the original path in Supabase
    const s3Url = publicUrl; // Use the public URL directly

    // Get file size from metadata or try to fetch it
    let fileSize = file.metadata?.size;
    if (!fileSize) {
      try {
        const headResponse = await axios.head(publicUrl, { timeout: 5000 });
        fileSize = parseInt(headResponse.headers['content-length'] || '0', 10);
      } catch (e) {
        // If we can't get the size, use 0
        fileSize = 0;
      }
    }

    // Save to database with type information
    await saveGeneratedPdf({
      filename: cleanFilename,
      s3Key,
      s3Url,
      fileSize: fileSize || 0,
      pdfType: type,
    });

    console.log(`[PDF Poller] ✓ Saved ${type} to database: ${cleanFilename} (${(fileSize || 0) / 1024} KB)`);
  } catch (error: any) {
    console.error(`[PDF Poller] Error processing ${file.name}:`, error.message);
    if (error.stack) {
      console.error(`[PDF Poller] Stack trace:`, error.stack);
    }
  }
}
