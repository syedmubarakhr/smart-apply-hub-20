import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/roles")({
  head: () => ({
    meta: [
      { title: "Roles — SATS Developer Console" },
      { name: "description", content: "Role definitions used for access control." },
      { property: "og:title", content: "Roles — SATS Developer Console" },
      { property: "og:description", content: "Role definitions used for access control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={ShieldCheck}
      title="Roles"
      description="Role definitions used for access control."
      emptyTitle="No custom roles"
      emptyDescription="Platform roles and their assignment rules will appear here."
    />
  );
}
