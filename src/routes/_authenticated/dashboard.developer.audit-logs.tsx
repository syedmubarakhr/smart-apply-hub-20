import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — SATS Developer Console" },
      { name: "description", content: "Security and compliance event trail." },
      { property: "og:title", content: "Audit Logs — SATS Developer Console" },
      { property: "og:description", content: "Security and compliance event trail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={ScrollText}
      title="Audit Logs"
      description="Security and compliance event trail."
      emptyTitle="No audit events"
      emptyDescription="Security events are recorded here as users act on the platform."
    />
  );
}
