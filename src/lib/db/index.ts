/**
 * Database client for Supabase Postgres via postgres.js.
 * Use Supabase's *transaction pooler* URL (port 6543) in serverless: the pooler
 * shares a few real connections among many short-lived functions.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and add your Supabase URL.");
  }
  // The transaction pooler doesn't support prepared statements, so turn them off.
  const client = postgres(url, { prepare: false, max: 5 });
  return { client, db: drizzle(client, { schema }) };
}

let instance: ReturnType<typeof createDb> | undefined;

/** Lazily created so builds without a database still compile. */
export function db() {
  instance ??= createDb();
  return instance.db;
}

/** Closes the connection pool. Only scripts need this; the server keeps it open. */
export async function closeDb(): Promise<void> {
  await instance?.client.end();
  instance = undefined;
}

export * from "./schema";
