import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-12 w-full appearance-none rounded-lg border border-input bg-card px-4 pr-10 text-body text-foreground transition-colors duration-150 focus:border-success focus:outline-none focus:ring-2 focus:ring-success/30 disabled:opacity-[0.38] disabled:pointer-events-none",
          invalid && "border-danger focus:border-danger focus:ring-danger/25",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
});
