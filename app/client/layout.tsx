"use client";

import type { ReactNode } from "react";
import ClientSidebar from "@/components/client/ClientSidebar";

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <ClientSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
