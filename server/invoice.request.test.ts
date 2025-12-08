import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

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

describe("invoice.request", () => {
  it("should successfully request invoice with valid data", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Mock successful webhook response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        pdf: "https://example.com/invoice.pdf",
      },
    });

    const result = await caller.invoice.request({
      uc: "123456789",
      cpfCnpj: "12345678900",
      birthDate: "01/01/1990",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://n8n.pagluz.com.br/webhook/celesc-bot",
      {
        uc: "123456789",
        cpfCnpj: "12345678900",
        birthDate: "01/01/1990",
      },
      expect.objectContaining({
        timeout: 120000,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should handle webhook errors gracefully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Mock webhook error
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    const result = await caller.invoice.request({
      uc: "123456789",
      cpfCnpj: "12345678900",
      birthDate: "01/01/1990",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should validate birth date format", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.invoice.request({
        uc: "123456789",
        cpfCnpj: "12345678900",
        birthDate: "1990-01-01", // Wrong format
      })
    ).rejects.toThrow();
  });
});
