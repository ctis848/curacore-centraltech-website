"use client";

type TopbarProps = {
  collapsed: boolean;
  toggleCollapse: () => void;
  openMobile: () => void;
};

export default function Topbar({ collapsed, toggleCollapse, openMobile }: TopbarProps) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
      {/* Collapse toggle (mobile only) */}
      <button
        onClick={toggleCollapse}
        className="text-gray-700 hover:text-gray-900 md:hidden"
      >
        {collapsed ? "Open Menu" : "Close Menu"}
      </button>

      {/* Title */}
      <h1 className="font-semibold text-lg text-gray-800">Dashboard</h1>

      {/* Mobile menu button */}
      <button
        onClick={openMobile}
        className="text-gray-700 hover:text-gray-900 md:hidden"
      >
        Menu
      </button>
    </header>
  );
}
