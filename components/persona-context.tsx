"use client";
import { createContext, useContext, useState } from "react";

export type Persona = "pharmacy" | "consumer";

type PersonaContextValue = {
  persona: Persona;
  setPersona: (persona: Persona) => void;
};

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  // A home sempre inicia na visão de farmácia; a troca é feita pelo toggle do header.
  const [persona, setPersona] = useState<Persona>("pharmacy");
  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona deve ser usado dentro de PersonaProvider");
  return ctx;
}
