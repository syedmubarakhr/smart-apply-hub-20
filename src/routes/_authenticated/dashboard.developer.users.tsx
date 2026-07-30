import { createFileRoute } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/users")({
  head: () => ({
    meta: [
      { title: "Users — SATS Developer Console" },
      { name: "description", content: "Every account across all tenants." },
      { property: "og:title", content: "Users — SATS Developer Console" },
      { property: "og:description", content: "Every account across all tenants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={Users2}
      title="Users"
      description="Every account across all tenants."
      emptyTitle="No users to show"
      emptyDescription="User accounts appear once tenants invite their teams."
    />
  );
}
