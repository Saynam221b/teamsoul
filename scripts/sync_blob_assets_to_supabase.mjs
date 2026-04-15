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

function keyId(...parts) {
  return parts.filter(Boolean).join("__").toLowerCase().replace(/[^a-z0-9_]/g, "_");
}

const connectionString = await getEnvVar("POSTGRES_URL_NON_POOLING");
if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING in environment");
}

const blobAssetPath = path.resolve(process.cwd(), "src/data/blob-assets.json");
const blobAssets = JSON.parse(await readFile(blobAssetPath, "utf8"));
const files = Object.entries(blobAssets.files ?? {});

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  for (const [relativePath, url] of files) {
    await client.query(
      `
        insert into public.blob_assets (id, relative_path, url, created_at, updated_at)
        values ($1, $2, $3, now(), now())
        on conflict (relative_path)
        do update set url = excluded.url, updated_at = now()
      `,
      [keyId("blob_asset", relativePath), relativePath, url]
    );
  }

  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log(`Synced ${files.length} blob asset mappings to Supabase.`);
} finally {
  await client.end();
}
