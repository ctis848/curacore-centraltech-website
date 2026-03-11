"use client";

import AuthGuard from "../_components/AuthGuard";
import InvoicesContent from "./content";

export default function Page() {
  return (
    <AuthGuard>
      <InvoicesContent />
    </AuthGuard>
  );
}
