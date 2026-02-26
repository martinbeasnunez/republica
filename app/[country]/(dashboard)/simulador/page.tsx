import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import { SimuladorClient } from "./simulador-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  return {
    title: `Simulador Electoral — Escenarios ${name} ${year}`,
    description: `Simulador electoral con Monte Carlo para las elecciones ${name} ${year}. Calcula probabilidades basado en encuestas.`,
    alternates: { canonical: `https://${config?.domain ?? "condorperu.vercel.app"}/${country}/simulador` },
  };
}

export const dynamic = "force-dynamic";

export default async function SimuladorPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <SimuladorClient candidates={candidates} />;
}
