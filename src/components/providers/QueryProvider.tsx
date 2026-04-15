"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { getQueryClient } from "@/lib/query/queryClient";
import { localStoragePersister } from "@/lib/query/persister";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        buster: process.env.NEXT_PUBLIC_CACHE_BUSTER ?? "v1",
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
