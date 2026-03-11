"use client";

import AuthGuard from "../_components/AuthGuard";
import MachineHistoryContent from "./content";

export default function Page() {
  return (
    <AuthGuard>
      <MachineHistoryContent />
    </AuthGuard>
  );
}
