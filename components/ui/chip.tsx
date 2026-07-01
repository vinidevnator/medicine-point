import Link from "next/link";
import { cn } from "@/lib/cn";

const chipBase =
  "inline-flex min-h-9 items-center gap-1.5 rounded-pill border px-4 py-1.5 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const chipActive = "border-primary bg-primary text-primary-foreground";
const chipInactive = "border-border bg-card text-foreground hover:bg-muted";

type ChipProps = {
  active?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Chip({
  active = false,
  href,
  className,
  children,
  ...rest
}: ChipProps & { href: string }) {
  return (
    <Link href={href} className={cn(chipBase, active ? chipActive : chipInactive, className)} {...rest}>
      {children}
    </Link>
  );
}

export function ChipButton({
  active = false,
  className,
  children,
  ...rest
}: ChipProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(chipBase, active ? chipActive : chipInactive, className)} {...rest}>
      {children}
    </button>
  );
}
