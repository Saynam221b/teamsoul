import { getPlayerById } from "@/data/helpers";
import blobAssetsRaw from "@/data/blob-assets.json";

type BlobAssetsFile = {
  generatedAt: string;
  totalFiles: number;
  files: Record<string, string>;
};

const blobAssets = blobAssetsRaw as BlobAssetsFile;

const BGIS_FOLDER = "BGMI_2026_current_with_higglist_bgis/BGIS 2026/";

const CHAMPIONSHIP_PLAYER_ORDER = [
  { id: "nakul", folder: "Nakul" },
  { id: "goblin", folder: "Goblin" },
  { id: "legit", folder: "Legit" },
  { id: "jokerr", folder: "Joker" },
  { id: "thunder", folder: "Thunder" },
] as const;

const PREFERRED_PLAYER_IMAGE_KEYS: Record<string, string> = {
  nakul: "BGMI_2026_current_with_higglist_bgis/Nakul/DSC01912.jpeg",
  goblin: "BGMI_2026_current_with_higglist_bgis/Goblin/DSC01723.jpeg",
  legit: "BGMI_2026_current_with_higglist_bgis/Legit/DSC01682.jpeg",
  jokerr: "BGMI_2026_current_with_higglist_bgis/Joker/IMG_0953.JPG",
  thunder: "BGMI_2026_current_with_higglist_bgis/Thunder/DSC00296.jpeg",
};

function getUrlsByPrefix(prefix: string, limit?: number): string[] {
  const urls = Object.entries(blobAssets.files)
    .filter(([relativePath]) => relativePath.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);

  return typeof limit === "number" ? urls.slice(0, limit) : urls;
}

export function getBgisHighlights() {
  const highlightUrls = getUrlsByPrefix(BGIS_FOLDER, 12);

  return highlightUrls.map((url, index) => ({
    id: `bgis-highlight-${index + 1}`,
    url,
    alt: `BGIS 2026 highlight ${index + 1}`,
  }));
}

export function getChampionPlayers() {
  return CHAMPIONSHIP_PLAYER_ORDER.map(({ id, folder }) => {
    const player = getPlayerById(id);
    const preferredImage = PREFERRED_PLAYER_IMAGE_KEYS[id];
    const fallbackImage = getUrlsByPrefix(
      `BGMI_2026_current_with_higglist_bgis/${folder}/`,
      1
    )[0];
    const image = blobAssets.files[preferredImage] ?? fallbackImage ?? null;

    return {
      id,
      displayName: player?.displayName ?? id,
      role: player?.role ?? "Player",
      impact: player?.impact ?? "Team SouL BGIS 2026 champion roster member.",
      image,
    };
  });
}

export function getBlobAssetStats() {
  return {
    generatedAt: blobAssets.generatedAt,
    totalFiles: blobAssets.totalFiles,
  };
}
