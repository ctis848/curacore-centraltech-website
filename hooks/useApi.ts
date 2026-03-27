"use client";

import { useState } from "react";

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function request(url: string, options: RequestInit = {}) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(url, {
        credentials: "include",
        ...options,
      });

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid JSON response");
      }

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data as T;
    } catch (err: any) {
      setError(err.message || "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { request, loading, error };
}
