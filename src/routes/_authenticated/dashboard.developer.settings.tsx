import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SATS Developer Console" },
      { name: "description", content: "Platform configuration and preferences." },
      { property: "og:title", content: "Settings — SATS Developer Console" },
      { property: "og:description", content: "Platform configuration and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={Settings}
      title="Settings"
      description="Platform configuration and preferences."
      emptyTitle="No settings configured"
      emptyDescription="Platform-level configuration options will appear here."
    />
  );
}
