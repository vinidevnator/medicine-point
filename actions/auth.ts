"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authService } from "@/services/auth.service";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type AuthState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const TOO_MANY = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

async function ip(): Promise<string> {
  return clientIp(await headers());
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = rateLimit(`register:${await ip()}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) return { ok: false, error: TOO_MANY };

  const res = await authService.register(formData);
  if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const clientAddr = await ip();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  // Throttle by IP and by targeted account to blunt credential stuffing/brute force.
  const byIp = rateLimit(`login:ip:${clientAddr}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  const byAccount = email
    ? rateLimit(`login:email:${email}`, { limit: 5, windowMs: 15 * 60 * 1000 })
    : { ok: true, retryAfterMs: 0 };
  if (!byIp.ok || !byAccount.ok) return { ok: false, error: TOO_MANY };

  const res = await authService.login(formData);
  if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await authService.logout();
  redirect("/login");
}