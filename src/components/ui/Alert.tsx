import React from "react";

interface AlertProps {
  variant?: "success" | "warning" | "danger" | "info";
  title?: string;
  children?: React.ReactNode;
}

export function Alert({ variant = "info", title, children }: AlertProps) {
  const variants = {
    success: "bg-success/15 text-success border-success/40",
    warning: "bg-warning/15 text-warning border-warning/40",
    danger: "bg-danger/15 text-danger border-danger/40",
    info: "bg-primary/10 text-primary border-primary/30",
  };

  return (
    <div className={`border rounded-md p-4 ${variants[variant]}`}>
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <p className="text-sm">{children}</p>
    </div>
  );
}
