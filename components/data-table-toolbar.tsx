"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText } from "lucide-react";

type DataTableToolbarProps = {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
};

export function DataTableToolbar({
  globalFilter,
  setGlobalFilter,
  onExportCSV,
  onExportPDF,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Search */}
      <Input
        placeholder="Search..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="w-64"
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>

        <Button variant="outline" onClick={onExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
