import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  interactive?: boolean;
  selected?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, interactive = false, selected = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground",
        selected ? "border-primary" : "border-border",
        interactive && "transition-shadow duration-150 hover:shadow-hover hover:border-primary/40",
        padded && "p-6",
        className
      )}
      {...props}
    />
  );
});
