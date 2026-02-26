import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import { EnVivoClient } from "./en-vivo-client";

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
    title: `Cobertura en Vivo — Elecciones ${name} ${year}`,
    description: `Seguimiento en vivo de las elecciones ${name} ${year}. Datos en tiempo real y tendencias de encuestas.`,
    alternates: { canonical: `https://${config?.domain ?? "condorperu.vercel.app"}/${country}/en-vivo` },
  };
}

export const dynamic = "force-dynamic";

export default async function EnVivoPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const topCandidates = await fetchTopCandidates(6, country);

  return <EnVivoClient topCandidates={topCandidates} />;
}
