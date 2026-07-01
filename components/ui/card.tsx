import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", padded && "p-5", className)}
      {...props}
    />
  );
});