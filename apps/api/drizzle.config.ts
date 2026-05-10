import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Drizzle CLI runs from apps/api, so load the API-local env file explicitly.
loadEnv({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

export default defineConfig({
  // Source of truth for table definitions used to generate migrations.
  schema: "./src/common/db/schema.ts",
  // Generated migration files and Drizzle metadata live here.
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Neon Postgres connection string from apps/api/.env.local or runtime env.
    url: databaseUrl,
  },
});
