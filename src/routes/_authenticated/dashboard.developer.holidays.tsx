import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/holidays")({
  head: () => ({
    meta: [
      { title: "Holiday Management — SATS Developer Console" },
      { name: "description", content: "Calendars, regional holidays, and overrides." },
      { property: "og:title", content: "Holiday Management — SATS Developer Console" },
      { property: "og:description", content: "Calendars, regional holidays, and overrides." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={CalendarDays}
      title="Holiday Management"
      description="Calendars, regional holidays, and overrides."
      emptyTitle="No holiday calendars"
      emptyDescription="Configured calendars and holiday overrides will appear here."
    />
  );
}
