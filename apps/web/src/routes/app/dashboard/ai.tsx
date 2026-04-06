import { createFileRoute } from "@tanstack/react-router";
import AISettingsPage from "@/pages/dashboard/ai/page";

export const Route = createFileRoute("/app/dashboard/ai")({
  component: AISettingsPage
});
