import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { SimuladorClient } from "./simulador-client";

export const metadata: Metadata = {
  title: "Simulador Electoral — Escenarios Elecciones Perú 2026",
  description: "Simulador electoral con Monte Carlo para las elecciones Perú 2026. Calcula probabilidades de primera y segunda vuelta basado en encuestas actualizadas.",
  alternates: { canonical: "https://condorperu.vercel.app/simulador" },
};

export const dynamic = "force-dynamic";

export default async function SimuladorPage() {
  const candidates = await fetchCandidates();

  return <SimuladorClient candidates={candidates} />;
}
