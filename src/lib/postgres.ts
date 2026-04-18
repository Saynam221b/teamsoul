import pg from "pg";

const { Pool } = pg;

const useNonPooling = process.env.POSTGRES_USE_NON_POOLING === "1";
const rawConnectionString = useNonPooling
  ? process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || ""
  : process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || "";
const connectionString = rawConnectionString
  .replace(/([?&])sslmode=[^&]+&?/i, "$1")
  .replace(/[?&]$/g, "");

function getPoolMax() {
  const fromEnv = Number(process.env.POSTGRES_POOL_MAX || "1");
  if (!Number.isFinite(fromEnv)) return 1;
  return Math.max(1, Math.min(10, Math.trunc(fromEnv)));
}

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
      max: getPoolMax(),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return pool;
}
