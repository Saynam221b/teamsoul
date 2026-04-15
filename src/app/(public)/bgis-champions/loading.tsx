import ArchiveRouteLoader from "@/components/shared/ArchiveRouteLoader";

export default function Loading() {
  return (
    <ArchiveRouteLoader
      route="champions"
      title="Loading champions gallery"
      subtitle="Preparing BGIS showcase"
      metrics={[
        { label: "Portraits", value: "Champion five" },
        { label: "Staff", value: "Support lane" },
        { label: "Frames", value: "Highlight reel" },
      ]}
    />
  );
}
