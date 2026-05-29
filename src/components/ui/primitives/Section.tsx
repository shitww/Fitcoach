import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
}

export function Section({
  className,
  title,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      {title && (
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
