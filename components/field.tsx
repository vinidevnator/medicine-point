import { cn } from "@/lib/cn";

export function Field({
  label, htmlFor, error, hint, className, children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {message ? (
        <p className="mt-1 text-xs text-danger" role="alert">{message}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}