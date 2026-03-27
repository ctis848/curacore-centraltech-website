"use client";

import { useParams } from "next/navigation";

import MachineDetails from "@/app/client/panel/components/MachineDetails";
import MachinePerformanceSummary from "@/app/client/panel/components/MachinePerformanceSummary";
import MachineUsageChart from "@/app/client/panel/components/MachineUsageChart";
import MachineActivityTimeline from "@/app/client/panel/components/MachineActivityTimeline";
import MachineAlertsPanel from "@/app/client/panel/components/MachineAlertsPanel";
import MachineLogsViewer from "@/app/client/panel/components/MachineLogsViewer";
import MachineManagementActions from "@/app/client/panel/components/MachineManagementActions";

function MachineOverviewPage() {
  const params = useParams();
  const machineId = params.machineId as string;

  return (
    <div className="p-6 space-y-10">

      <MachineDetails machineId={machineId} />

      <MachinePerformanceSummary machineId={machineId} />

      <MachineUsageChart machineId={machineId} />

      <MachineActivityTimeline machineId={machineId} />

      <MachineAlertsPanel machineId={machineId} />

      <MachineLogsViewer machineId={machineId} />

      <MachineManagementActions machineId={machineId} />

    </div>
  );
}

export default MachineOverviewPage;
