import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function LogoMark({ className, tone = "brand" }: { className?: string; tone?: "brand" | "onDark" }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
        tone === "brand" ? "bg-primary text-primary-foreground" : "bg-white/15 text-white",
        className
      )}
    >
      <Plus className="size-[18px]" strokeWidth={2.5} aria-hidden />
    </span>
  );
}

export function Logo({ className, tone = "brand" }: { className?: string; tone?: "brand" | "onDark" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[17px] font-bold tracking-tight", tone === "brand" ? "text-foreground" : "text-white", className)}>
      <LogoMark tone={tone} />
      Medicine Point
    </span>
  );
}
