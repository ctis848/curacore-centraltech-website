import React from "react";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-surface text-surface-foreground shadow-card rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
