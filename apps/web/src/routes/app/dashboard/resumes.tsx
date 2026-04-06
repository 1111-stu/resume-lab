import { createFileRoute } from "@tanstack/react-router";
import ResumesPage from "@/pages/dashboard/resumes/page";

export const Route = createFileRoute("/app/dashboard/resumes")({
  component: ResumesPage
});
