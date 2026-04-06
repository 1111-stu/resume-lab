import { createFileRoute } from "@tanstack/react-router";
import TemplatesPage from "@/pages/dashboard/templates/page";

export const Route = createFileRoute("/app/dashboard/templates")({
  component: TemplatesPage
});
