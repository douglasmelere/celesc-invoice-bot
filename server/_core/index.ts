import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startScheduler } from "../scheduler";
import { startPdfPoller } from "../pdfPoller";
import axios from "axios";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback (disabled - not using OAuth)
  // registerOAuthRoutes(app);
  // PDF proxy endpoint to fix CORS and bucket issues
  app.get("/api/pdf/:id", async (req, res) => {
    try {
      const { getAllGeneratedPdfs } = await import("../db");
      const pdfs = await getAllGeneratedPdfs();
      const pdf = pdfs.find(p => p.id === parseInt(req.params.id));
      
      if (!pdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      // Reconstruct the Supabase URL from s3Key
      const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL;
      const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
      
      if (!SUPABASE_STORAGE_URL || !SUPABASE_API_KEY) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // The s3Key contains the path (e.g., "faturas/arquivo.pdf" or "resumos/arquivo.pdf")
      // Use the signed URL endpoint instead of public URL
      const signedUrlEndpoint = `${SUPABASE_STORAGE_URL}/object/sign/celesc-faturas/${pdf.s3Key}`;
      
      console.log(`[PDF Proxy] Getting signed URL for PDF ${pdf.id}: ${signedUrlEndpoint}`);

      let response;
      try {
        // First, get a signed URL from Supabase
        const signResponse = await axios.post(
          signedUrlEndpoint,
          {},
          {
            headers: {
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
              apikey: SUPABASE_API_KEY,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        const signedUrl = signResponse.data.signedURL;
        console.log(`[PDF Proxy] Got signed URL, fetching PDF...`);

        // Fetch the PDF using the signed URL
        response = await axios.get(signedUrl, {
          responseType: "stream",
          timeout: 30000,
          validateStatus: (status) => status === 200,
        });
      } catch (error: any) {
        console.error(`[PDF Proxy] Error getting signed URL:`, error.message);
        if (error.response) {
          console.error(`[PDF Proxy] Response status:`, error.response.status);
          console.error(`[PDF Proxy] Response data:`, error.response.data);
        }
        
        // Fallback: try direct download with API key
        console.log(`[PDF Proxy] Trying direct download with API key...`);
        const downloadUrl = `${SUPABASE_STORAGE_URL}/object/celesc-faturas/${pdf.s3Key}`;
        try {
          response = await axios.get(downloadUrl, {
            responseType: "stream",
            timeout: 30000,
            headers: {
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
              apikey: SUPABASE_API_KEY,
            },
            validateStatus: (status) => status === 200,
          });
        } catch (fallbackError: any) {
          console.error(`[PDF Proxy] Direct download also failed:`, fallbackError.message);
          throw new Error(`Failed to fetch PDF: ${error.message}`);
        }
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${pdf.filename}"`);
      res.setHeader("Cache-Control", "public, max-age=3600");
      response.data.pipe(res);
    } catch (error: any) {
      console.error("[PDF Proxy] Error:", error.message);
      if (error.response) {
        console.error("[PDF Proxy] Response status:", error.response.status);
        console.error("[PDF Proxy] Response data:", error.response.data);
      }
      res.status(500).json({ error: "Failed to fetch PDF", details: error.message });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start background scheduler for dispatches
    startScheduler();
    // Start PDF polling service
    startPdfPoller();
  });
}

startServer().catch(console.error);
