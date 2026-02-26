import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import MapaClient from "./mapa-client";

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
    title: `Mapa Electoral — Distribución Regional ${name} ${year}`,
    description: `Mapa electoral interactivo de ${name} ${year}. Distribución regional de preferencias electorales.`,
    alternates: { canonical: `https://${config?.domain ?? "condorperu.vercel.app"}/${country}/mapa` },
  };
}

export const dynamic = "force-dynamic";

export default async function MapaPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <MapaClient candidates={candidates} />;
}
