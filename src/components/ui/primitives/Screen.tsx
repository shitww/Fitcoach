import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface ScreenProps extends HTMLAttributes<HTMLDivElement> {}

export function Screen({ className, children, ...props }: ScreenProps) {
  return (
    <div
      className={cn(
        "min-h-dvh bg-background text-foreground flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
