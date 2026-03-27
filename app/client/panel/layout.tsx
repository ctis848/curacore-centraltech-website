"use client";

import DashboardClient from "@/components/dashboard/DashboardClient";

export default function ClientPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClient>{children}</DashboardClient>;
}
