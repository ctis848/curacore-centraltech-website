"use client";

import AuthGuard from "../_components/AuthGuard";
import SettingsContent from "./content";

export default function Page() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
