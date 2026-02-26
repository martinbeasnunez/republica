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
  const isColombia = country === "co";

  return {
    title: isColombia
      ? `Análisis de Escenarios Electorales — ${name} ${year}`
      : `Simulador Electoral — Escenarios ${name} ${year}`,
    description: isColombia
      ? `Análisis de escenarios electorales con modelo Monte Carlo para las elecciones ${name} ${year}. Proyecciones basadas en encuestas.`
      : `Simulador electoral con Monte Carlo para las elecciones ${name} ${year}. Calcula probabilidades basado en encuestas.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/simulador` },
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
