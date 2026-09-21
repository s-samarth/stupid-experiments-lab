import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

/**
 * Migrations run through Supabase's *session* pooler (port 5432). The app uses
 * the transaction pooler (6543), which can't run schema changes reliably.
 * Same host, different port, so only one URL needs to be configured.
 */
const url = (process.env.DATABASE_URL ?? "").replace(":6543/", ":5432/");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
