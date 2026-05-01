import type { BlobAsset, MediaAsset, MediaCollection } from "@/data/types";
import { buildMediaCollection } from "./sourceTruth";

function toMediaAsset(id: string, title: string, imageUrl: string, assetType: MediaAsset["assetType"]): MediaAsset {
  return {
    id,
    title,
    imageUrl,
    assetType,
  };
}

export function getTournamentMediaCollection(
  tournamentId: string,
  assets: BlobAsset[]
): MediaCollection | null {
  if (tournamentId !== "bgis-2026") return null;

  const bgisAssets = assets.filter((asset) =>
    asset.relativePath.startsWith("BGMI_2026_current_with_higglist_bgis/BGIS 2026/")
  );

  if (bgisAssets.length === 0) return null;

  return buildMediaCollection(
    "bgis-2026-gallery",
    "BGIS 2026 Media Collection",
    "Portraits and highlight frames tied to the BGIS 2026 championship pass.",
    bgisAssets.slice(0, 12).map((asset, index) =>
      toMediaAsset(
        `bgis-2026-media-${index + 1}`,
        `BGIS 2026 frame ${index + 1}`,
        asset.url,
        index < 5 ? "highlight" : "gallery"
      )
    ),
    tournamentId
  );
}
