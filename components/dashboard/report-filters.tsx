"use client";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OPTIONS: Array<{ value: "today" | "yesterday" | "7d" | "30d" | "custom"; label: string }> = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "custom", label: "Personalizado" },
];

export function ReportFilters({ current }: { current: "today" | "yesterday" | "7d" | "30d" | "custom" }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <Chip key={o.value} href={`/dashboard/reports?f=${o.value}`} active={current === o.value}>
            {o.label}
          </Chip>
        ))}
      </div>
      {current === "custom" && (
        <form action="/dashboard/reports" method="GET" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="f" value="custom" />
          <label className="text-caption text-muted-foreground">
            De
            <Input type="date" name="from" className="mt-1 h-10" />
          </label>
          <label className="text-caption text-muted-foreground">
            Até
            <Input type="date" name="to" className="mt-1 h-10" />
          </label>
          <Button type="submit" size="sm">Aplicar</Button>
        </form>
      )}
    </div>
  );
}
