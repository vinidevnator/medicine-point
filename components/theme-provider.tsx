"use client";
import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };
const ThemeCtx = createContext<Ctx | null>(null);

// The <html> class (set before paint by the inline no-flash script in the root
// layout, then updated by `apply`) is the source of truth for the theme. We read
// it through useSyncExternalStore so the first client render matches the server
// (getServerSnapshot -> "light") and React re-syncs to the real value right
// after hydration — no hydration mismatch and no setState-in-effect.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const apply = useCallback((t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.setAttribute("data-mode", t);
    try {
      localStorage.setItem("mp-theme", t);
    } catch {
    }
    listeners.forEach((l) => l());
  }, []);

  const setTheme = useCallback((t: Theme) => apply(t), [apply]);
  const toggle = useCallback(() => apply(getSnapshot() === "dark" ? "light" : "dark"), [apply]);

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
