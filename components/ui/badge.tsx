import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = ({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "destructive" | "outline";
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variant === "default" && "bg-teal-600 text-white",
        variant === "destructive" && "bg-red-600 text-white",
        variant === "outline" && "border border-gray-300 text-gray-700",
        className
      )}
      {...props}
    />
  );
};

export { Badge };
