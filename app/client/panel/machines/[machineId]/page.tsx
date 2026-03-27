"use client";

import { useParams } from "next/navigation";
import MachineDetails from "@/app/client/panel/components/MachineDetails";

export default function MachineDetailsPage() {
  const params = useParams();
  const machineId = params.machineId as string;

  return (
    <div className="p-6">
      <MachineDetails machineId={machineId} />
    </div>
  );
}
