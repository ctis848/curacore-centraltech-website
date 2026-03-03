"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function Topbar({
  collapsed,
  toggleCollapse,
  openMobile,
}: {
  collapsed: boolean;
  toggleCollapse: () => void;
  openMobile: () => void;
}) {
  return (
    <header className="h-16 bg-white border-b flex items-center px-4 justify-between">
      {/* Mobile Menu Button */}
      <button className="lg:hidden" onClick={openMobile}>
        <Menu size={24} />
      </button>

      {/* Desktop Collapse Button */}
      <button className="hidden lg:block" onClick={toggleCollapse}>
        {collapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
      </button>

      <div className="font-medium text-gray-700">Dashboard</div>
    </header>
  );
}
