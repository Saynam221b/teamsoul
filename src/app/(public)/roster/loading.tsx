import ArchiveRouteLoader from "@/components/shared/ArchiveRouteLoader";

export default function Loading() {
  return (
    <ArchiveRouteLoader
      route="roster"
      title="Assembling roster timeline"
      subtitle="Loading roster archive"
      metrics={[
        { label: "Profiles", value: "Player cards" },
        { label: "Status", value: "Era filters" },
        { label: "Search", value: "Roster index" },
      ]}
    />
  );
}
