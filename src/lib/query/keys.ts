export const queryKeys = {
  tournaments: {
    all: ["tournaments"] as const,
    feed: () => [...queryKeys.tournaments.all, "feed"] as const,
  },
  archive: {
    all: ["archive"] as const,
    feed: () => [...queryKeys.archive.all, "feed"] as const,
  },
  blobAssets: {
    all: ["blob-assets"] as const,
    feed: () => [...queryKeys.blobAssets.all, "feed"] as const,
  },
} as const;
