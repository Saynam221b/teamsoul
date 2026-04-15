import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "TEAMSOUL_QUERY_CACHE",
});
