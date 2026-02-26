import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import { CompararClient } from "./comparar-client";

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
    title: `Comparar Candidatos ${year} — ${name}`,
    description: `Compara candidatos presidenciales ${name} ${year} lado a lado. Propuestas, encuestas, ideología y plan de gobierno.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/candidatos/comparar` },
  };
}

export const dynamic = "force-dynamic";

export default async function CompararPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);
  return <CompararClient candidates={candidates} />;
}
