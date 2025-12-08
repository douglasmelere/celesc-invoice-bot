CREATE TYPE "public"."pdfType" AS ENUM('fatura', 'resumo');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."scheduleType" AS ENUM('once', 'daily');--> statement-breakpoint
CREATE TABLE "generatedPdfs" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"s3Key" varchar(512) NOT NULL,
	"s3Url" varchar(1024) NOT NULL,
	"fileSize" integer,
	"pdfType" "pdfType" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduledDispatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"uc" varchar(255) NOT NULL,
	"cpfCnpj" varchar(18) NOT NULL,
	"birthDate" varchar(10) NOT NULL,
	"scheduleType" "scheduleType" NOT NULL,
	"scheduledTime" timestamp NOT NULL,
	"lastExecuted" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
