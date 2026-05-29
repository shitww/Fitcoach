import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const iconContainerVariants = cva(
  "inline-flex items-center justify-center rounded-xl",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        ghost: "bg-transparent text-muted-foreground",
        outline: "border border-border text-foreground",
      },
      size: {
        default: "h-10 w-10",
        sm: "h-8 w-8",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface IconContainerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconContainerVariants> {}

export function IconContainer({
  className,
  variant,
  size,
  children,
  ...props
}: IconContainerProps) {
  return (
    <div
      className={cn(iconContainerVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
