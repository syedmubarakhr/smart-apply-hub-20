import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SATS Developer Console" },
      { name: "description", content: "Exportable platform and tenant reporting." },
      { property: "og:title", content: "Reports — SATS Developer Console" },
      { property: "og:description", content: "Exportable platform and tenant reporting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={FileBarChart}
      title="Reports"
      description="Exportable platform and tenant reporting."
      emptyTitle="No reports generated"
      emptyDescription="Generated reports and scheduled exports will appear here."
    />
  );
}
