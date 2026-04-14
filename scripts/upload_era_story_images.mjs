import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

const API_URL = "https://blob.vercel-storage.com";
const BLOB_PREFIX = "team-soul-era-story";
const OUTPUT_FILE = process.argv[2] || "/tmp/team-soul-era-story-images.json";

const ERA_IMAGES = [
  { eraId: "og", fileName: "THE OG ERA.jpg", alt: "The OG Era lineup" },
  {
    eraId: "transition",
    fileName: "THE TRANSITION & BAN ERA.jpg",
    alt: "The Transition and Ban Era lineup",
  },
  {
    eraId: "superteam",
    fileName: "THE SUPERTEAM ERA.jpg",
    alt: "The Superteam Era lineup",
  },
  {
    eraId: "modern",
    fileName: "THE REBUILD & MODERN ERA.jpg",
    alt: "The Rebuild and Modern Era lineup",
  },
];

async function readTokenFromEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const envContent = await fs.readFile(envPath, "utf8");
    const tokenLine = envContent
      .split(/\r?\n/)
      .find((line) => line.startsWith("BLOB_READ_WRITE_TOKEN="));

    if (!tokenLine) return null;

    return tokenLine
      .slice("BLOB_READ_WRITE_TOKEN=".length)
      .trim()
      .replace(/^"(.*)"$/, "$1");
  } catch {
    return null;
  }
}

function safeName(fileName) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function uploadFile(filePath, blobPath, token) {
  const response = await fetch(`${API_URL}/${encodeURI(blobPath)}?access=public`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-version": "7",
      "content-type": getContentType(filePath),
    },
    body: createReadStream(filePath),
    duplex: "half",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed upload (${response.status}) ${path.basename(filePath)}: ${errorText}`);
  }

  return response.json();
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? (await readTokenFromEnvFile());
  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN in environment.");
  }

  const root = path.resolve(process.cwd(), "images");
  const uploaded = [];

  for (const image of ERA_IMAGES) {
    const localPath = path.join(root, image.fileName);
    await fs.access(localPath);
    const blobPath = `${BLOB_PREFIX}/${safeName(image.fileName)}`;
    process.stdout.write(`Uploading ${image.fileName} ... `);
    const result = await uploadFile(localPath, blobPath, token);
    uploaded.push({
      eraId: image.eraId,
      alt: image.alt,
      fileName: image.fileName,
      url: result.url,
    });
    process.stdout.write("done\n");
  }

  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), images: uploaded }, null, 2)}\n`,
    "utf8"
  );

  process.stdout.write(`\nSaved output to ${OUTPUT_FILE}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
