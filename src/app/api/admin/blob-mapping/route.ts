import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE_PATH = path.join(process.cwd(), "src/data/blob-assets.json");

type BlobAssetsFile = {
  generatedAt: string;
  totalFiles: number;
  files: Record<string, string>;
};

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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mapping = await readMapping();
  return NextResponse.json(mapping);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action: "create" | "update" | "delete";
    key?: string;
    newKey?: string;
    url?: string;
  };

  const mapping = await readMapping();
  const files = { ...mapping.files };

  if (body.action === "delete") {
    if (!body.key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    delete files[body.key];
    const next = await writeMapping({ ...mapping, files });
    return NextResponse.json(next);
  }

  if (!body.key || !body.url) {
    return NextResponse.json({ error: "Missing key or url" }, { status: 400 });
  }

  if (body.action === "create") {
    files[body.key] = body.url;
    const next = await writeMapping({ ...mapping, files });
    return NextResponse.json(next);
  }

  if (body.action === "update") {
    const targetKey = body.newKey?.trim() ? body.newKey : body.key;
    if (targetKey !== body.key) {
      delete files[body.key];
    }
    files[targetKey] = body.url;
    const next = await writeMapping({ ...mapping, files });
    return NextResponse.json(next);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
