"use client";

import { useParams } from "next/navigation";
import LicenseDetails from "@/app/client/panel/components/LicenseDetails";

export default function LicenseDetailsPage() {
  const params = useParams();
  const licenseKey = params.licenseKey as string;

  return (
    <div className="p-6">
      <LicenseDetails licenseKey={licenseKey} />
    </div>
  );
}
