import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

type Step = { label: string; description: string; icon: React.ComponentType<{ className?: string }>; at: number | null };

export function Stepper({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <ol className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-0">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const Icon = step.icon;
        return (
          <li
            key={step.label}
            className={cn(
              "flex flex-1 gap-3 md:flex-col md:items-center md:text-center",
              i < steps.length - 1 && "md:relative"
            )}
          >
            <div className="flex items-center gap-3 md:flex-col md:gap-2">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-pill border-2 transition-colors duration-150",
                  done && "border-success bg-success/10 text-success",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-muted text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "hidden md:block absolute left-[calc(50%+1.5rem)] top-5 h-0.5 w-[calc(100%-3rem)] rounded-pill",
                    done ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className={cn("text-body font-medium", active && "text-primary")}>{step.label}</p>
              <p className="text-body-sm text-muted-foreground">{step.description}</p>
              <p className="text-caption text-muted-foreground">{formatDateTime(step.at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
