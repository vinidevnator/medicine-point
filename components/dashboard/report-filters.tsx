"use client";
import Link from "next/link";
import { cn } from "@/lib/cn";

const OPTIONS: Array<{ value: "hoje" | "ontem" | "7d" | "30d" | "custom"; label: string }> = [
  { value: "hoje", label: "Hoje" },
  { value: "ontem", label: "Ontem" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "custom", label: "Personalizado" },
];

export function ReportFilters({ current }: { current: "hoje" | "ontem" | "7d" | "30d" | "custom" }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="flex flex-wrap gap-1">
        {OPTIONS.map((o) => (
          <Link
            key={o.value}
            href={`/dashboard/relatorios?f=${o.value}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition",
              current === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            )}
          >
            {o.label}
          </Link>
        ))}
      </div>
      {current === "custom" && (
        <form action="/dashboard/relatorios" method="GET" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="f" value="custom" />
          <label className="text-xs text-muted-foreground">De
            <input type="date" name="from" className="mt-1 block h-9 rounded-lg border border-input bg-card px-2 text-sm" />
          </label>
          <label className="text-xs text-muted-foreground">Até
            <input type="date" name="to" className="mt-1 block h-9 rounded-lg border border-input bg-card px-2 text-sm" />
          </label>
          <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            Aplicar
          </button>
        </form>
      )}
    </div>
  );
}