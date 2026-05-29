import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const cardVariants = cva("rounded-xl border border-border", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      muted: "bg-muted text-muted-foreground",
      glass: "bg-card/80 backdrop-blur-xl text-card-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({
  className,
  variant,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
