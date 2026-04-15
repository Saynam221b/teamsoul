import ArchiveRouteLoader from "@/components/shared/ArchiveRouteLoader";

export default function Loading() {
  return (
    <ArchiveRouteLoader
      route="tournaments"
      title="Syncing tournament board"
      subtitle="Loading tournament archive"
      metrics={[
        { label: "Board", value: "Live bracket" },
        { label: "Filters", value: "Tier + year" },
        { label: "Results", value: "Archive pass" },
      ]}
    />
  );
}
