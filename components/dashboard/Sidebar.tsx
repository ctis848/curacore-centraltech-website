"use client";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white shadow-lg h-screen fixed top-0 left-0 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-4 font-semibold text-gray-800">
          {collapsed ? "CT" : "CTIS Dashboard"}
        </div>

        <nav className="flex-1 px-2 space-y-2">
          <a href="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-100">
            Dashboard
          </a>
          <a href="/profile" className="block py-2 px-3 rounded hover:bg-gray-100">
            Profile
          </a>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onCloseMobile}
          />

          {/* Drawer */}
          <aside className="relative bg-white w-64 h-full shadow-lg z-50 p-4">
            <button
              onClick={onCloseMobile}
              className="mb-4 text-gray-700 hover:text-gray-900"
            >
              Close
            </button>

            <nav className="space-y-2">
              <a href="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-100">
                Dashboard
              </a>
              <a href="/profile" className="block py-2 px-3 rounded hover:bg-gray-100">
                Profile
              </a>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
