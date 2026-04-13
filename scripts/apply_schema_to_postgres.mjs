import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

function readEnv(content, key) {
  const line = content
    .split(/\r?\n/)
    .find((item) => item.startsWith(`${key}=`));
  if (!line) return "";
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^"(.*)"$/, "$1");
}

async function getEnvVar(name) {
  if (process.env[name]) return process.env[name];
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envContent = await readFile(envPath, "utf8");
  return readEnv(envContent, name);
}

const connectionString = await getEnvVar("POSTGRES_URL_NON_POOLING");
if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING in environment");
}

const sql = await readFile(path.resolve(process.cwd(), "supabase/schema.sql"), "utf8");
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("Schema applied successfully.");
} finally {
  await client.end();
}
