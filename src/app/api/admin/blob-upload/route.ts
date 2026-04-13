import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE_PATH = path.join(process.cwd(), "src/data/blob-assets.json");
const API_URL = "https://blob.vercel-storage.com";
const ROOT_PREFIX = "BGMI_2026_current_with_higglist_bgis";
const BLOB_PREFIX = "bgmi-assets";

type BlobAssetsFile = {
  generatedAt: string;
  totalFiles: number;
  files: Record<string, string>;
};

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

async function getToken() {
  return process.env.BLOB_READ_WRITE_TOKEN ?? (await readTokenFromEnvFile());
}

async function readMapping(): Promise<BlobAssetsFile> {
  const raw = await fs.readFile(FILE_PATH, "utf8");
  return JSON.parse(raw) as BlobAssetsFile;
}

async function writeMapping(payload: BlobAssetsFile) {
  const sortedFiles = Object.fromEntries(
    Object.entries(payload.files).sort(([a], [b]) => a.localeCompare(b))
  );

  const nextPayload: BlobAssetsFile = {
    generatedAt: new Date().toISOString(),
    totalFiles: Object.keys(sortedFiles).length,
    files: sortedFiles,
  };

  await fs.writeFile(FILE_PATH, `${JSON.stringify(nextPayload, null, 2)}\n`, "utf8");
  return nextPayload;
}

function isAuthorized(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return request.headers.get("x-admin-password") === adminPassword;
}

function sanitizeName(value: string) {
  return value.trim().replaceAll(" ", "-");
}

function toBlobPath(mappingKey: string) {
  const withoutRoot = mappingKey.startsWith(`${ROOT_PREFIX}/`)
    ? mappingKey.slice(`${ROOT_PREFIX}/`.length)
    : mappingKey;
  const normalized = withoutRoot
    .split("/")
    .map((segment) => sanitizeName(segment))
    .join("/");
  return `${BLOB_PREFIX}/${normalized}`;
}

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 });
  }

  const formData = await request.formData();
  const folderRaw = String(formData.get("folder") ?? `${ROOT_PREFIX}/Uploads`).trim();
  const folder = folderRaw.startsWith(ROOT_PREFIX) ? folderRaw : `${ROOT_PREFIX}/${folderRaw}`;

  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const mapping = await readMapping();
  const nextFiles = { ...mapping.files };
  const uploaded: Array<{ key: string; url: string }> = [];

  for (const file of files) {
    if (!file.name) continue;

    const mappingKey = `${folder}/${sanitizeName(file.name)}`;
    const blobPath = toBlobPath(mappingKey);
    const url = `${API_URL}/${encodeURI(blobPath)}?access=public`;
    const body = Buffer.from(await file.arrayBuffer());

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-version": "7",
        "content-type": getContentType(file.name),
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Upload failed for ${file.name}: ${errorText}` },
        { status: 500 }
      );
    }

    const data = (await response.json()) as { url: string };
    nextFiles[mappingKey] = data.url;
    uploaded.push({ key: mappingKey, url: data.url });
  }

  const saved = await writeMapping({ ...mapping, files: nextFiles });
  return NextResponse.json({ ...saved, uploaded });
}
