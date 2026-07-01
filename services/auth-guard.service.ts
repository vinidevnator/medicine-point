import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export type CurrentSession = {
  userId: string;
  pharmacyId: string;
  role: "pharmacy_admin";
};

export async function requirePharmacy(): Promise<CurrentSession> {
  const session = await getSession();
  if (!session) redirect("/entrar");
  return { userId: session.userId, pharmacyId: session.pharmacyId, role: session.role };
}

export async function requirePharmacyOrReturn(): Promise<CurrentSession | null> {
  return await getSession();
}