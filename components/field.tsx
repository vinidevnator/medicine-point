import { cn } from "@/lib/cn";
import { AlertCircle } from "lucide-react";

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
      <label htmlFor={htmlFor} className="mb-1.5 block text-label text-foreground">
        {label}
      </label>
      {children}
      {message ? (
        <p className="mt-1.5 flex items-center gap-1 text-caption text-danger" role="alert">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {message}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-caption text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
