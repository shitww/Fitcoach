import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const surfaceVariants = cva("", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      card: "bg-card text-card-foreground border border-border",
      elevated: "bg-card text-card-foreground border border-border shadow-sm",
      muted: "bg-muted text-muted-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      glass: "bg-card/80 backdrop-blur-xl border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SurfaceProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export function Surface({
  className,
  variant,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div className={cn(surfaceVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
