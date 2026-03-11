"use client";

import AuthGuard from "../_components/AuthGuard";
import SupportContent from "./content";

export default function Page() {
  return (
    <AuthGuard>
      <SupportContent />
    </AuthGuard>
  );
}
