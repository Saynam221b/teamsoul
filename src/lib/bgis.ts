import type { BlobAsset, Player, StaffMember } from "@/data/types";

const BGIS_FOLDER = "BGMI_2026_current_with_higglist_bgis/BGIS 2026/";

const CHAMPIONSHIP_PLAYER_ORDER = [
  { id: "nakul", folder: "Nakul" },
  { id: "goblin", folder: "Goblin" },
  { id: "legit", folder: "Legit" },
  { id: "jokerr", folder: "Joker" },
  { id: "thunder", folder: "Thunder" },
] as const;

const CHAMPIONSHIP_STAFF_ORDER = [{ id: "ayogi", folder: "Ayogi" }] as const;

const PREFERRED_PLAYER_IMAGE_KEYS: Record<string, string> = {
  nakul: "BGMI_2026_current_with_higglist_bgis/Nakul/DSC01912.jpeg",
  goblin: "BGMI_2026_current_with_higglist_bgis/Goblin/DSC01723.jpeg",
  legit: "BGMI_2026_current_with_higglist_bgis/Legit/DSC01682.jpeg",
  jokerr: "BGMI_2026_current_with_higglist_bgis/Joker/IMG_0953.JPG",
  thunder: "BGMI_2026_current_with_higglist_bgis/Thunder/DSC00296.jpeg",
};

const PREFERRED_STAFF_IMAGE_KEYS: Record<string, string> = {
  ayogi: "BGMI_2026_current_with_higglist_bgis/Ayogi/DSC00464.jpeg",
};

type ChampionCard = {
  id: string;
  displayName: string;
  role: string;
  impact: string;
  image: string | null;
};

type HighlightFrame = {
  id: string;
  url: string;
  alt: string;
};

function getUrlsByPrefix(assets: BlobAsset[], prefix: string, limit?: number): string[] {
  const urls = assets
    .filter((asset) => asset.relativePath.startsWith(prefix))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    .map((asset) => asset.url);

  return typeof limit === "number" ? urls.slice(0, limit) : urls;
}

function buildAssetLookup(assets: BlobAsset[]) {
  return Object.fromEntries(assets.map((asset) => [asset.relativePath, asset.url]));
}

export function getBgisHighlights(assets: BlobAsset[]): HighlightFrame[] {
  return getUrlsByPrefix(assets, BGIS_FOLDER, 12).map((url, index) => ({
    id: `bgis-highlight-${index + 1}`,
    url,
    alt: `BGIS 2026 highlight ${index + 1}`,
  }));
}

export function getChampionPlayers(
  players: Player[],
  assets: BlobAsset[]
): ChampionCard[] {
  const playerLookup = Object.fromEntries(players.map((player) => [player.id, player]));
  const assetLookup = buildAssetLookup(assets);

  return CHAMPIONSHIP_PLAYER_ORDER.map(({ id, folder }) => {
    const player = playerLookup[id];
    const preferredImage = PREFERRED_PLAYER_IMAGE_KEYS[id];
    const fallbackImage = getUrlsByPrefix(
      assets,
      `BGMI_2026_current_with_higglist_bgis/${folder}/`,
      1
    )[0];

    return {
      id,
      displayName: player?.displayName ?? id,
      role: player?.role ?? "Player",
      impact: player?.impact ?? "Team SOUL BGIS 2026 champion roster member.",
      image: assetLookup[preferredImage] ?? fallbackImage ?? null,
    };
  });
}

export function getChampionStaff(
  staff: StaffMember[],
  assets: BlobAsset[]
): ChampionCard[] {
  const staffLookup = Object.fromEntries(staff.map((member) => [member.id, member]));
  const assetLookup = buildAssetLookup(assets);

  return CHAMPIONSHIP_STAFF_ORDER.map(({ id, folder }) => {
    const member = staffLookup[id];
    const preferredImage = PREFERRED_STAFF_IMAGE_KEYS[id];
    const fallbackImage = getUrlsByPrefix(
      assets,
      `BGMI_2026_current_with_higglist_bgis/${folder}/`,
      1
    )[0];

    return {
      id,
      displayName: member?.displayName ?? id,
      role: member?.role ?? "Staff",
      impact: member?.impact ?? "Team SOUL championship staff member.",
      image: assetLookup[preferredImage] ?? fallbackImage ?? null,
    };
  });
}
