// app/admin/components/RequireRole.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";

interface RequireRoleProps {
  role: "ADMIN" | "SUPER_ADMIN";
  children: ReactNode;
}

export default function RequireRole({ role, children }: RequireRoleProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/admin/api/me")
      .then((res) => res.json())
      .then((user) => {
        if (!user?.role) return setAllowed(false);
        setAllowed(user.role === role || user.role === "SUPER_ADMIN");
      })
      .catch(() => setAllowed(false));
  }, [role]);

  if (allowed === null) {
    return <p className="p-6 dark:text-white">Checking permissions...</p>;
  }

  if (!allowed) {
    return (
      <p className="p-6 text-red-500 dark:text-red-400">
        You do not have permission to view this page.
      </p>
    );
  }

  return <>{children}</>;
}
