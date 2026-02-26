import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import { PlanesPageClient } from "./planes-page-client";

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
    title: `Planes de Gobierno ${year} — Propuestas de Todos los Candidatos`,
    description: `Planes de gobierno elecciones ${name} ${year}: propuestas de todos los candidatos. Compara por economía, seguridad, salud y educación.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/planes` },
  };
}

export const dynamic = "force-dynamic";

export default async function PlanesPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <PlanesPageClient candidates={candidates} />;
}
