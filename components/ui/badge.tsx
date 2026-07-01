import { cn } from "@/lib/cn";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-soft-pink text-primary-pressed",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning-ink",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
};

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground"
      aria-label={`${count} item(ns) no carrinho`}
    >
      {count}
    </span>
  );
}
