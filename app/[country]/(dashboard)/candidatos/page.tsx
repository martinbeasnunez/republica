import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import { CandidatosClient } from "./candidatos-client";

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
    title: `Candidatos Presidenciales ${year} — ${name}`,
    description: `Candidatos presidenciales ${name} ${year}. Propuestas, encuestas y comparador lado a lado.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/candidatos` },
  };
}

export const dynamic = "force-dynamic";

export default async function CandidatosPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);
  return <CandidatosClient candidates={candidates} />;
}
