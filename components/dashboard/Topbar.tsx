'use client';

type TopbarProps = {
  collapsed: boolean;
  toggleCollapse: () => void;
  openMobile: () => void;
};

export default function Topbar({ collapsed, toggleCollapse, openMobile }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">

        {/* Sidebar toggle (desktop) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
        >
          {collapsed ? (
            <span className="text-xl">➡️</span>
          ) : (
            <span className="text-xl">⬅️</span>
          )}
        </button>

        {/* Mobile menu button */}
        <button
          onClick={openMobile}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
        >
          ☰
        </button>

        {/* Title or breadcrumb placeholder */}
        <h1 className="text-lg font-semibold text-gray-700">
          Dashboard
        </h1>

        {/* Right-side actions */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center">
            🔔
          </button>

          <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center">
            👤
          </button>
        </div>
      </div>
    </header>
  );
}
