// packages/db/prisma.config.ts
import "dotenv/config";

declare const process: {
  env: Record<string, string | undefined>;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined in environment variables or .env file.",
  );
}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
};
