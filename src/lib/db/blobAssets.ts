import type {
  BlobAsset,
  PublicBlobAssetFeedResult,
} from "@/data/types";
import { getPostgresPool, isPostgresConfigured } from "@/lib/postgres";

type DbBlobAssetRow = {
  relative_path: string;
  url: string;
  created_at: string | null;
};

function buildUnavailableBlobAssets(message: string): PublicBlobAssetFeedResult {
  return {
    assets: [],
    generatedAt: null,
    totalFiles: 0,
    source: "unavailable",
    message,
  };
}

export function getBlobAssetFeedUnavailableMessage(message?: string): string {
  return message ?? "BGIS asset mapping is unavailable right now.";
}

export async function getPublicBlobAssetFeed(): Promise<PublicBlobAssetFeedResult> {
  if (!isPostgresConfigured()) {
    return buildUnavailableBlobAssets("Live BGIS asset mapping is not configured.");
  }

  const pool = getPostgresPool();
  if (!pool) {
    return buildUnavailableBlobAssets("Live BGIS asset mapping could not initialize.");
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
    return buildUnavailableBlobAssets(
      `Live BGIS asset mapping is temporarily unavailable. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
