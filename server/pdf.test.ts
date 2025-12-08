import { describe, expect, it, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb, saveGeneratedPdf } from "./db";
import { generatedPdfs } from "../drizzle/schema";

function createTestContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("pdf endpoints", () => {
  let testPdfIds: number[] = [];

  afterEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db && testPdfIds.length > 0) {
      for (const id of testPdfIds) {
        try {
          await db.delete(generatedPdfs).where(generatedPdfs.id.eq(id));
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      testPdfIds = [];
    }
  });

  it("should list all generated PDFs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test PDF
    const testPdf = await saveGeneratedPdf({
      filename: "test_invoice.pdf",
      s3Key: "test/test_invoice.pdf",
      s3Url: "https://example.com/test_invoice.pdf",
      fileSize: 12345,
      pdfType: "fatura",
    });

    testPdfIds.push(testPdf.id);

    // List PDFs
    const pdfs = await caller.pdf.list();

    expect(Array.isArray(pdfs)).toBe(true);
    expect(pdfs.length).toBeGreaterThan(0);

    const found = pdfs.find((p) => p.id === testPdf.id);
    expect(found).toBeDefined();
    expect(found?.filename).toBe("test_invoice.pdf");
    expect(found?.fileSize).toBe(12345);
  });

  it("should delete a PDF", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test PDF
    const testPdf = await saveGeneratedPdf({
      filename: "delete_test.pdf",
      s3Key: "test/delete_test.pdf",
      s3Url: "https://example.com/delete_test.pdf",
      fileSize: 54321,
      pdfType: "resumo",
    });

    const pdfId = testPdf.id;

    // Delete it
    const result = await caller.pdf.delete({ id: pdfId });
    expect(result.success).toBe(true);

    // Verify it's gone
    const pdfs = await caller.pdf.list();
    const found = pdfs.find((p) => p.id === pdfId);
    expect(found).toBeUndefined();
  });

  it("should return PDFs with all required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test PDF with all fields
    const testPdf = await saveGeneratedPdf({
      filename: "complete_test.pdf",
      s3Key: "test/complete_test.pdf",
      s3Url: "https://example.com/complete_test.pdf",
      fileSize: 9999,
      pdfType: "fatura",
    });
    testPdfIds.push(testPdf.id);

    // List PDFs
    const pdfs = await caller.pdf.list();

    // Find our test PDF
    const found = pdfs.find((p) => p.id === testPdf.id);

    expect(found).toBeDefined();
    expect(found?.filename).toBe("complete_test.pdf");
    expect(found?.s3Key).toBe("test/complete_test.pdf");
    expect(found?.s3Url).toBe("https://example.com/complete_test.pdf");
    expect(found?.fileSize).toBe(9999);
    expect(found?.createdAt).toBeDefined();
  });
});
