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

const dataPath = path.resolve(process.cwd(), "src/data/data.json");
const data = JSON.parse(await readFile(dataPath, "utf8"));

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  for (const era of data.eras) {
    await client.query(
      `
        update public.eras
        set story_image_url = $2,
            story_image_alt = $3,
            updated_at = now()
        where id = $1
      `,
      [era.id, era.storyImageUrl ?? null, era.storyImageAlt ?? null]
    );
  }

  for (const member of Object.values(data.staff ?? {})) {
    await client.query(
      `
        insert into public.staff_members (
          id,
          display_name,
          real_name,
          role,
          join_date,
          leave_date,
          is_active,
          impact,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, now())
        on conflict (id)
        do update set
          display_name = excluded.display_name,
          real_name = excluded.real_name,
          role = excluded.role,
          join_date = excluded.join_date,
          leave_date = excluded.leave_date,
          is_active = excluded.is_active,
          impact = excluded.impact,
          updated_at = now()
      `,
      [
        member.id,
        member.displayName,
        member.realName ?? "",
        member.role ?? "",
        member.joinDate,
        member.leaveDate ?? null,
        member.isActive,
        member.impact ?? "",
      ]
    );

    for (const [index, eraId] of member.eras.entries()) {
      await client.query(
        `
          insert into public.staff_eras (id, staff_id, era_id, created_at)
          values ($1, $2, $3, now())
          on conflict (staff_id, era_id)
          do nothing
        `,
        [keyId("staff_era", member.id, eraId, String(index + 1)), member.id, eraId]
      );
    }
  }

  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("Synced archive runtime tables to Postgres.");
} finally {
  await client.end();
}
