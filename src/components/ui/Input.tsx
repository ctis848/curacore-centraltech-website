import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-md border border-border bg-background text-foreground 
                  focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${className}`}
      {...props}
    />
  );
}
