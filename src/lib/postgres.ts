import pg from "pg";

const { Pool } = pg;

const rawConnectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || "";
const connectionString = rawConnectionString
  .replace(/([?&])sslmode=[^&]+&?/i, "$1")
  .replace(/[?&]$/g, "");

let pool: InstanceType<typeof Pool> | null = null;

export function isPostgresConfigured() {
  return Boolean(connectionString);
}

export function getPostgresPool() {
  if (!connectionString) return null;

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
  }

  return pool;
}
