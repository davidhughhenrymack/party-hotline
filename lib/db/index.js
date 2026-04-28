import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";

const DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "NEON_DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
];

let cachedDb = null;

export function getDatabaseUrl() {
  const key = DATABASE_URL_ENV_KEYS.find((envKey) => process.env[envKey]);

  if (!key) {
    throw new Error(
      `Missing database connection string. Expected one of: ${DATABASE_URL_ENV_KEYS.join(", ")}`,
    );
  }

  return process.env[key];
}

function createDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!cachedDb) {
    cachedDb = createDb();
  }

  return cachedDb;
}
