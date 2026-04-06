import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/layouts/dashboard-layout";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }]
  }),
  ssr: false,
  component: DashboardRouteLayout
});

function DashboardRouteLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
