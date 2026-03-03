"use client";

import { useEffect, useState } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (!data.user) {
        window.location.href = "/login";
      } else {
        setAllowed(true);
      }
    }

    check();
  }, []);

  return allowed ? <>{children}</> : null;
}
