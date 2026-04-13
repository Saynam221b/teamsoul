import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const ROOT_DIR = process.argv[2] || "BGMI_2026_current_with_higglist_bgis";
const OUTPUT_FILE = process.argv[3] || "src/data/blob-assets.json";
const BLOB_PREFIX = "bgmi-assets";
const API_URL = "https://blob.vercel-storage.com";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function readTokenFromEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const envContent = await fs.readFile(envPath, "utf8");
    const tokenLine = envContent
      .split(/\r?\n/)
      .find((line) => line.startsWith("BLOB_READ_WRITE_TOKEN="));
    if (!tokenLine) return null;

    const rawValue = tokenLine.slice("BLOB_READ_WRITE_TOKEN=".length).trim();
    return rawValue.replace(/^"(.*)"$/, "$1");
  } catch {
    return null;
  }
}

const runtimeToken = TOKEN ?? (await readTokenFromEnvFile());

if (!runtimeToken) {
  throw new Error("Missing BLOB_READ_WRITE_TOKEN in environment.");
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nested = await walk(fullPath);
      files.push(...nested);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toBlobPath(localPath) {
  const relative = path.relative(ROOT_DIR, localPath).replaceAll("\\", "/");
  const safeRelative = relative
    .split("/")
    .map((segment) => segment.replaceAll(" ", "-"))
    .join("/");
  return `${BLOB_PREFIX}/${safeRelative}`;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function uploadFile(localPath, blobPath) {
  const contentType = getContentType(localPath);
  const url = `${API_URL}/${encodeURI(blobPath)}?access=public`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${runtimeToken}`,
      "x-api-version": "7",
      "content-type": contentType,
    },
    body: createReadStream(localPath),
    duplex: "half",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed upload (${response.status}) ${localPath}: ${errorText}`);
  }

  return response.json();
}

async function main() {
  const absoluteRoot = path.resolve(process.cwd(), ROOT_DIR);
  const absoluteOutput = path.resolve(process.cwd(), OUTPUT_FILE);
  const files = await walk(absoluteRoot);

  if (files.length === 0) {
    throw new Error(`No image files found under ${absoluteRoot}`);
  }

  const mapping = {};

  for (const file of files) {
    const blobPath = toBlobPath(file);
    const relativePath = path.relative(process.cwd(), file).replaceAll("\\", "/");
    process.stdout.write(`Uploading ${relativePath} ... `);
    const uploaded = await uploadFile(file, blobPath);
    mapping[relativePath] = uploaded.url;
    process.stdout.write("done\n");
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    files: mapping,
  };

  await fs.mkdir(path.dirname(absoluteOutput), { recursive: true });
  await fs.writeFile(absoluteOutput, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  process.stdout.write(`\nSaved mapping to ${OUTPUT_FILE}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
