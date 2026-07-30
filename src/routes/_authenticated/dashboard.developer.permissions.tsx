import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions — SATS Developer Console" },
      { name: "description", content: "Granular capability grants per role." },
      { property: "og:title", content: "Permissions — SATS Developer Console" },
      { property: "og:description", content: "Granular capability grants per role." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={KeyRound}
      title="Permissions"
      description="Granular capability grants per role."
      emptyTitle="No permission sets"
      emptyDescription="Define capability grants to see them mapped here."
    />
  );
}
