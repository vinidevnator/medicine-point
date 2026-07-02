import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo(props: { className?: string; tone?: "brand" | "onDark" }) {
  const { className } = props;
  return (
    <Image
      src="/img/logo.webp"
      alt="Medicine Point"
      width={154}
      height={36}
      className={cn("h-9 w-auto shrink-0", className)}
    />
  );
}
