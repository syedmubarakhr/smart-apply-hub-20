import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/companies")({
  head: () => ({
    meta: [
      { title: "Companies — SATS Developer Console" },
      { name: "description", content: "Tenant organisations onboarded to the platform." },
      { property: "og:title", content: "Companies — SATS Developer Console" },
      { property: "og:description", content: "Tenant organisations onboarded to the platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={Building2}
      title="Companies"
      description="Tenant organisations onboarded to the platform."
      emptyTitle="No companies yet"
      emptyDescription="Onboarded tenant workspaces will be listed here."
    />
  );
}
