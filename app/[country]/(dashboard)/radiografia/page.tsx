import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import RadiografiaIndexClient from "./radiografia-index-client";

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
    title: `Radiografía de Candidatos — Análisis Profundo ${name} ${year}`,
    description: `Radiografía completa de los candidatos presidenciales ${name} ${year}. Patrimonio, procesos legales y financiamiento.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/radiografia` },
  };
}

export const dynamic = "force-dynamic";

export default async function RadiografiaIndexPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <RadiografiaIndexClient candidates={candidates} />;
}
