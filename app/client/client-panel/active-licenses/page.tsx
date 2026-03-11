"use client";

import AuthGuard from "../_components/AuthGuard";
import ActiveLicensesContent from "./content";

export default function Page() {
  return (
    <AuthGuard>
      <ActiveLicensesContent />
    </AuthGuard>
  );
}
