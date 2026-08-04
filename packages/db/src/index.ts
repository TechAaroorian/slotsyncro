// packages/db/src/index.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaAdapter as BasePrismaAdapter } from "@auth/prisma-adapter";
import ws from "ws";

// Set up WebSocket constructor for Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Export pre-configured Auth.js PrismaAdapter factory
export const PrismaAdapter = () => BasePrismaAdapter(db);

export * from "@prisma/client";
