import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/departments")({
  head: () => ({
    meta: [
      { title: "Departments — SATS Developer Console" },
      { name: "description", content: "Organisational units inside each tenant." },
      { property: "og:title", content: "Departments — SATS Developer Console" },
      { property: "og:description", content: "Organisational units inside each tenant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={Network}
      title="Departments"
      description="Organisational units inside each tenant."
      emptyTitle="No departments"
      emptyDescription="Departments created by tenants will be listed here."
    />
  );
}
