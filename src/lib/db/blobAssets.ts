import blobAssetsRaw from "@/data/blob-assets.json";
import type {
  BlobAsset,
  DataFeedDegradedReason,
  PublicBlobAssetFeedResult,
} from "@/data/types";
import { getPostgresPool, isPostgresConfigured } from "@/lib/postgres";

type BlobAssetsFile = {
  generatedAt: string;
  totalFiles: number;
  files: Record<string, string>;
};

type DbBlobAssetRow = {
  relative_path: string;
  url: string;
  created_at: string | null;
};

const blobAssets = blobAssetsRaw as BlobAssetsFile;

function getFallbackBlobAssets(
  reason: DataFeedDegradedReason,
  details?: string
): PublicBlobAssetFeedResult {
  const detailSuffix = details ? ` ${details}` : "";
  console.warn(`[blob-assets] Falling back to bundled blob asset mapping due to ${reason}.${detailSuffix}`);

  return {
    assets: Object.entries(blobAssets.files).map(([relativePath, url]) => ({
      relativePath,
      url,
      createdAt: blobAssets.generatedAt,
    })),
    generatedAt: blobAssets.generatedAt,
    totalFiles: blobAssets.totalFiles,
    source: "fallback",
    degradedReason: reason,
  };
}

export function getBlobAssetFeedFallbackMessage(
  reason?: DataFeedDegradedReason
): string {
  switch (reason) {
    case "missing_supabase_config":
      return "Live BGIS asset mapping is not configured. Showing the bundled asset snapshot.";
    case "missing_supabase_client":
      return "Live BGIS asset mapping could not initialize. Showing the bundled asset snapshot.";
    case "query_error":
      return "Live BGIS asset mapping is temporarily unavailable. Showing the bundled asset snapshot.";
    default:
      return "Showing the bundled asset snapshot.";
  }
}

export async function getPublicBlobAssetFeed(): Promise<PublicBlobAssetFeedResult> {
  if (!isPostgresConfigured()) {
    return getFallbackBlobAssets("missing_supabase_config");
  }

  const pool = getPostgresPool();
  if (!pool) {
    return getFallbackBlobAssets("missing_supabase_client");
  }

  try {
    const result = await pool.query(
      `
        select relative_path, url, created_at::text as created_at
        from public.blob_assets
        order by relative_path asc
      `
    );

    const rows = result.rows as DbBlobAssetRow[];
    const assets = rows.map<BlobAsset>((item: DbBlobAssetRow) => ({
      relativePath: item.relative_path,
      url: item.url,
      createdAt: item.created_at,
    }));
    const generatedAt =
      assets.reduce<string | null>((latest: string | null, asset: BlobAsset) => {
        if (!asset.createdAt) return latest;
        if (!latest || asset.createdAt > latest) return asset.createdAt;
        return latest;
      }, null) ?? null;

    return {
      assets,
      generatedAt,
      totalFiles: assets.length,
      source: "db",
    };
  } catch (error) {
    return getFallbackBlobAssets(
      "query_error",
      error instanceof Error ? error.message : String(error)
    );
  }
}
