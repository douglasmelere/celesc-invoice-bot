// Storage helpers using Supabase Storage directly

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

function getStorageConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = SUPABASE_STORAGE_URL;
  const apiKey = SUPABASE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Supabase Storage credentials missing: set SUPABASE_STORAGE_URL and SUPABASE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  // Supabase Storage upload endpoint
  const url = new URL(`object/celesc-faturas/${normalizeKey(relKey)}`, ensureTrailingSlash(baseUrl));
  return url;
}

function buildDownloadUrl(
  baseUrl: string,
  relKey: string
): string {
  // Supabase public URL
  const encodedPath = encodeURIComponent(normalizeKey(relKey));
  return `${baseUrl}/object/public/celesc-faturas/${encodedPath}`;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}


function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  
  // Convert data to Blob for FormData
  const blob = typeof data === "string"
    ? new Blob([data], { type: contentType })
    : new Blob([data as any], { type: contentType });
  
  const formData = new FormData();
  formData.append("file", blob, key.split("/").pop() ?? key);
  
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(apiKey),
      // Supabase doesn't need Content-Type header when using FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  
  // Return the public URL
  const url = buildDownloadUrl(baseUrl, key);
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: buildDownloadUrl(baseUrl, key),
  };
}
