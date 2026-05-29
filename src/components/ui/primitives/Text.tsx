import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const textVariants = cva("", {
  variants: {
    variant: {
      default: "text-foreground",
      primary: "text-foreground",
      secondary: "text-muted-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      danger: "text-destructive-foreground",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
    },
    size: {
      default: "text-base",
      hero: "text-hero font-extrabold tracking-tight",
      section: "text-section font-bold",
      metric: "text-metric-label font-medium",
      caption: "text-caption font-medium uppercase tracking-wider",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface TextProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {}

export function Text({
  className,
  variant,
  size,
  children,
  ...props
}: TextProps) {
  return (
    <span className={cn(textVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
