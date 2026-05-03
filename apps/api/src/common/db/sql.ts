import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

export const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
