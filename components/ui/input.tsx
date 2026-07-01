import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-12 w-full rounded-lg border border-input bg-card px-4 text-body text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus:border-success focus:outline-none focus:ring-2 focus:ring-success/30 disabled:opacity-[0.38] disabled:pointer-events-none",
        invalid && "border-danger focus:border-danger focus:ring-danger/25",
        className
      )}
      {...props}
    />
  );
});
