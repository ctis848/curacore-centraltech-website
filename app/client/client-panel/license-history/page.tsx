"use client";

import AuthGuard from "../_components/AuthGuard";
import LicenseHistoryContent from "./content";

export default function Page() {
  return (
    <AuthGuard>
      <LicenseHistoryContent />
    </AuthGuard>
  );
}
