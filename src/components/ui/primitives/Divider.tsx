import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps) {
  return (
    <div
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...props}
    />
  );
}
