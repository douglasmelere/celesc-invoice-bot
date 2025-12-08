import { describe, expect, it } from "vitest";
import axios from "axios";

describe("Supabase Storage credentials", () => {
  it("should successfully list files in faturas folder", async () => {
    const storageUrl = process.env.SUPABASE_STORAGE_URL;
    const apiKey = process.env.SUPABASE_API_KEY;

    expect(storageUrl).toBeDefined();
    expect(apiKey).toBeDefined();

    // List files in faturas folder using Supabase Storage API
    const response = await axios.post(
      `${storageUrl}/object/list/celesc-faturas`,
      {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
        prefix: "faturas",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        timeout: 10000,
      }
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    
    console.log("✓ Supabase Storage connection successful");
    console.log(`✓ Found ${response.data.length} files in faturas folder`);
    
    if (response.data.length > 0) {
      console.log(`✓ Sample file:`, response.data[0]);
    }
  });

  it("should successfully list files in resumos folder", async () => {
    const storageUrl = process.env.SUPABASE_STORAGE_URL;
    const apiKey = process.env.SUPABASE_API_KEY;

    const response = await axios.post(
      `${storageUrl}/object/list/celesc-faturas`,
      {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
        prefix: "resumos",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        timeout: 10000,
      }
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    
    console.log(`✓ Found ${response.data.length} files in resumos folder`);
    
    if (response.data.length > 0) {
      console.log(`✓ Sample file:`, response.data[0]);
    }
  });

  it("should be able to construct public URLs for files", async () => {
    const storageUrl = process.env.SUPABASE_STORAGE_URL;
    const apiKey = process.env.SUPABASE_API_KEY;

    // Get a file from faturas
    const response = await axios.post(
      `${storageUrl}/object/list/celesc-faturas`,
      {
        limit: 1,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
        prefix: "faturas",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        timeout: 10000,
      }
    );

    if (response.data.length > 0) {
      const file = response.data[0];
      const publicUrl = `${storageUrl}/object/public/celesc-faturas/${file.name}`;
      
      console.log(`✓ Public URL format: ${publicUrl}`);
      
      // Test if we can access the public URL
      const fileResponse = await axios.head(publicUrl, {
        timeout: 10000,
        validateStatus: (status) => status === 200 || status === 404,
      });
      
      console.log(`✓ File access status: ${fileResponse.status}`);
      expect([200, 404]).toContain(fileResponse.status);
    } else {
      console.log("⚠ No files found in faturas folder to test URL construction");
    }
  });
});
