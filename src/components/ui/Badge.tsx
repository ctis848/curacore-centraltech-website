import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  children: React.ReactNode;
}

export function Badge({ variant = "primary", children }: BadgeProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-md font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
