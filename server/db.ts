import { eq, and, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { InsertUser, users, scheduledDispatches, InsertScheduledDispatch, ScheduledDispatch, generatedPdfs, InsertGeneratedPdf, GeneratedPdf } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const { Pool } = pg;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Scheduled Dispatches helpers
export async function createScheduledDispatch(dispatch: InsertScheduledDispatch): Promise<ScheduledDispatch> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(scheduledDispatches).values(dispatch).returning();
  return result[0]!;
}

export async function getActiveScheduledDispatches(): Promise<ScheduledDispatch[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(scheduledDispatches).where(eq(scheduledDispatches.isActive, true));
}

export async function getDueScheduledDispatches(currentTime: Date): Promise<ScheduledDispatch[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(scheduledDispatches)
    .where(
      and(
        eq(scheduledDispatches.isActive, true),
        lte(scheduledDispatches.scheduledTime, currentTime)
      )
    );
}

export async function updateScheduledDispatchExecution(id: number, lastExecuted: Date, nextScheduledTime?: Date): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = { lastExecuted };
  if (nextScheduledTime) {
    updateData.scheduledTime = nextScheduledTime;
  }

  await db.update(scheduledDispatches)
    .set(updateData)
    .where(eq(scheduledDispatches.id, id));
}

export async function deleteScheduledDispatch(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(scheduledDispatches).where(eq(scheduledDispatches.id, id));
}

export async function toggleScheduledDispatch(id: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(scheduledDispatches)
    .set({ isActive })
    .where(eq(scheduledDispatches.id, id));
}

// Generated PDFs helpers
export async function saveGeneratedPdf(pdf: InsertGeneratedPdf): Promise<GeneratedPdf> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(generatedPdfs).values(pdf).returning();
  return result[0]!;
}

export async function getAllGeneratedPdfs(): Promise<GeneratedPdf[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(generatedPdfs).orderBy(desc(generatedPdfs.createdAt));
}

export async function deleteGeneratedPdf(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(generatedPdfs).where(eq(generatedPdfs.id, id));
}
