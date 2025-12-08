import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { scheduledDispatches } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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

describe("invoice.schedule", () => {
  let testDispatchIds: number[] = [];

  afterEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db && testDispatchIds.length > 0) {
      for (const id of testDispatchIds) {
        try {
          await db.delete(scheduledDispatches).where(scheduledDispatches.id.eq(id));
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      testDispatchIds = [];
    }
  });

  it("should create a one-time scheduled dispatch", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);

    const result = await caller.invoice.schedule({
      uc: "123456789",
      cpfCnpj: "12345678900",
      birthDate: "01/01/1990",
      scheduleType: "once",
      scheduledTime: futureDate,
    });

    expect(result.success).toBe(true);
    expect(result.dispatch).toBeDefined();
    expect(result.dispatch.scheduleType).toBe("once");
    expect(result.dispatch.isActive).toBe(true);

    testDispatchIds.push(result.dispatch.id);
  });

  it("should create a daily recurring dispatch", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    const result = await caller.invoice.schedule({
      uc: "987654321",
      cpfCnpj: "98765432100",
      birthDate: "15/05/1985",
      scheduleType: "daily",
      scheduledTime: futureDate,
    });

    expect(result.success).toBe(true);
    expect(result.dispatch).toBeDefined();
    expect(result.dispatch.scheduleType).toBe("daily");

    testDispatchIds.push(result.dispatch.id);
  });

  it("should list scheduled dispatches", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test dispatch
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    const createResult = await caller.invoice.schedule({
      uc: "111222333",
      cpfCnpj: "11122233344",
      birthDate: "20/10/1995",
      scheduleType: "once",
      scheduledTime: futureDate,
    });

    testDispatchIds.push(createResult.dispatch.id);

    // List dispatches
    const dispatches = await caller.invoice.listScheduled();

    expect(Array.isArray(dispatches)).toBe(true);
    expect(dispatches.length).toBeGreaterThan(0);
    
    const found = dispatches.find(d => d.id === createResult.dispatch.id);
    expect(found).toBeDefined();
    expect(found?.uc).toBe("111222333");
  });

  it("should delete a scheduled dispatch", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test dispatch
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    const createResult = await caller.invoice.schedule({
      uc: "444555666",
      cpfCnpj: "44455566677",
      birthDate: "10/12/2000",
      scheduleType: "once",
      scheduledTime: futureDate,
    });

    const dispatchId = createResult.dispatch.id;

    // Delete it
    const deleteResult = await caller.invoice.deleteScheduled({ id: dispatchId });
    expect(deleteResult.success).toBe(true);

    // Verify it's gone
    const dispatches = await caller.invoice.listScheduled();
    const found = dispatches.find(d => d.id === dispatchId);
    expect(found).toBeUndefined();
  });

  it("should toggle dispatch active status", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test dispatch
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    const createResult = await caller.invoice.schedule({
      uc: "777888999",
      cpfCnpj: "77788899900",
      birthDate: "25/03/1988",
      scheduleType: "daily",
      scheduledTime: futureDate,
    });

    testDispatchIds.push(createResult.dispatch.id);
    const dispatchId = createResult.dispatch.id;

    // Toggle to inactive
    await caller.invoice.toggleScheduled({ id: dispatchId, isActive: false });

    // Verify status changed - need to query database directly since listScheduled only returns active
    const db = await getDb();
    const result = await db!.select().from(scheduledDispatches).where(eq(scheduledDispatches.id, dispatchId));
    expect(result[0]?.isActive).toBe(false);

    // Toggle back to active
    await caller.invoice.toggleScheduled({ id: dispatchId, isActive: true });

    const resultAfter = await db!.select().from(scheduledDispatches).where(eq(scheduledDispatches.id, dispatchId));
    expect(resultAfter[0]?.isActive).toBe(true);
  });
});
