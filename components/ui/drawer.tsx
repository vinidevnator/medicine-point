"use client";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50 md:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        className={cn("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "absolute left-0 top-0 h-full w-72 max-w-[85%] bg-card border-r border-border shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-label={title}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar menu">✕</Button>
        </div>
        <nav className="p-2">{children}</nav>
      </aside>
    </div>
  );
}