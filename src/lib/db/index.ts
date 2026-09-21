/**
 * Database client. Neon's HTTP driver sends each query as one HTTPS request,
 * which suits serverless functions (no connection pool to exhaust).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon URL.");
  }
  return drizzle(neon(url), { schema });
}

let instance: ReturnType<typeof createDb> | undefined;

/** Lazily created so builds without a database still compile. */
export function db() {
  instance ??= createDb();
  return instance;
}

export * from "./schema";
