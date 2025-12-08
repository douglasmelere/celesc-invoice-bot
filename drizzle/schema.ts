import { serial, pgEnum, pgTable, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

// Define enums first
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const scheduleTypeEnum = pgEnum("scheduleType", ["once", "daily"]);
export const pdfTypeEnum = pgEnum("pdfType", ["fatura", "resumo"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scheduled dispatches table for storing invoice request schedules
 */
export const scheduledDispatches = pgTable("scheduledDispatches", {
  id: serial("id").primaryKey(),
  uc: varchar("uc", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 18 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // dd/mm/yyyy format
  scheduleType: scheduleTypeEnum("scheduleType").notNull(),
  scheduledTime: timestamp("scheduledTime").notNull(), // When to execute
  lastExecuted: timestamp("lastExecuted"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ScheduledDispatch = typeof scheduledDispatches.$inferSelect;
export type InsertScheduledDispatch = typeof scheduledDispatches.$inferInsert;

/**
 * Generated PDFs table for storing received PDF files from Supabase Storage
 */
export const generatedPdfs = pgTable("generatedPdfs", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(), // S3 storage key
  s3Url: varchar("s3Url", { length: 1024 }).notNull(), // Public URL to access PDF
  fileSize: integer("fileSize"), // Size in bytes
  pdfType: pdfTypeEnum("pdfType").notNull(), // Type of PDF
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedPdf = typeof generatedPdfs.$inferSelect;
export type InsertGeneratedPdf = typeof generatedPdfs.$inferInsert;
