import "@/app/globals.css";
import Link from "next/link";
import { adminGuard } from "@/lib/guards/adminGuard";
import DarkModeToggle from "@/components/DarkModeToggle";
import AdminBreadcrumbs from "@/components/AdminBreadcrumbs";
import AdminRealtimeNotifications from "@/components/AdminRealtimeNotifications";
import AdminSearchBar from "@/components/AdminSearchBar";
import AdminProfileMenu from "@/components/AdminProfileMenu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await adminGuard(); // Protect all admin pages

  const role = user.user_metadata?.role ?? "admin";

  const sidebarItems = getSidebarItems(role);

  return (
    <html lang="en" className="dark:bg-gray-900 dark:text-gray-100">
      <body className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-6 space-y-6 hidden md:block">
          <h2 className="text-2xl font-black mb-6">CTIS Admin</h2>

          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <SidebarLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <MobileSidebar items={sidebarItems} />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 space-y-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <AdminBreadcrumbs />

            <div className="flex items-center gap-4">
              <AdminSearchBar />
              <AdminRealtimeNotifications />
              <DarkModeToggle />
              <AdminProfileMenu user={user} />
            </div>
          </div>

          {children}
        </main>
      </body>
    </html>
  );
}

/* ---------------- Sidebar Link Component ---------------- */

function SidebarLink({ href, label }: { href: string; label: string }) {
  const path =
    typeof window !== "undefined" ? window.location.pathname : "";

  const active = path.startsWith(href);

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg transition ${
        active
          ? "bg-teal-600 text-white"
          : "hover:text-teal-400 text-gray-300"
      }`}
    >
      {label}
    </Link>
  );
}

/* ---------------- Role-Based Sidebar Items ---------------- */

function getSidebarItems(role: string) {
  const base = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/licenses", label: "Licenses" },
    { href: "/admin/machines", label: "Machine Logs" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  if (role === "admin") {
    base.push(
      { href: "/admin/licenses/generate", label: "Generate License" },
      { href: "/admin/activation-requests", label: "Activation Requests" },
      { href: "/admin/settings", label: "Settings" }
    );
  }

  if (role === "support") {
    base.push({ href: "/admin/support", label: "Support Tools" });
  }

  return base;
}

/* ---------------- Mobile Sidebar ---------------- */

function MobileSidebar({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="md:hidden fixed top-4 left-4 z-50">
      <details className="bg-gray-900 text-white p-4 rounded-xl shadow-lg">
        <summary className="cursor-pointer text-lg font-bold">Menu</summary>

        <nav className="mt-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block hover:text-teal-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </div>
  );
}
