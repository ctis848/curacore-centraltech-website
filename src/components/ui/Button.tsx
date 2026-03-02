import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border text-foreground hover:bg-surface",
    danger: "bg-danger text-danger-foreground hover:bg-danger/90",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
