import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { ConsoleSection } from "@/components/dashboard/console-section";

export const Route = createFileRoute("/_authenticated/dashboard/developer/ai-engine")({
  head: () => ({
    meta: [
      { title: "AI Engine — SATS Developer Console" },
      { name: "description", content: "Matching models, thresholds, and inference usage." },
      { property: "og:title", content: "AI Engine — SATS Developer Console" },
      { property: "og:description", content: "Matching models, thresholds, and inference usage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleSection
      icon={BrainCircuit}
      title="AI Engine"
      description="Matching models, thresholds, and inference usage."
      emptyTitle="No models configured"
      emptyDescription="Model configuration and inference usage will appear here."
    />
  );
}
