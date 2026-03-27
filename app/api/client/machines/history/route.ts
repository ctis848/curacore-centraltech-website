import { NextResponse } from "next/server";

type MachineHistory = {
  id: string;
  licenseKey: string;
  machineId: string;
  action: "ACTIVATED" | "DEACTIVATED" | "TRANSFERRED";
  timestamp: string;
};

function getTestMachineHistory(): MachineHistory[] {
  const now = new Date();
  const minus3 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3);
  const minus15 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15);

  return [
    {
      id: "MACH-001",
      licenseKey: "ACTIVE-TEST-001",
      machineId: "PC-4455",
      action: "ACTIVATED",
      timestamp: minus3.toISOString(),
    },
    {
      id: "MACH-002",
      licenseKey: "ACTIVE-TEST-002",
      machineId: "LAPTOP-9981",
      action: "TRANSFERRED",
      timestamp: minus15.toISOString(),
    },
  ];
}

export async function GET() {
  const history = getTestMachineHistory();
  return NextResponse.json({ history });
}
