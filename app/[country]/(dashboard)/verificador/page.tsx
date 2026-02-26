import type { Metadata } from "next";
import { fetchFactChecks, fetchFactCheckStats } from "@/lib/data/fact-checks";
import { getCountryConfig } from "@/lib/config/countries";
import VerificadorClient from "./verificador-client";

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
    title: `Verificador de Hechos — Fact Check Elecciones ${name} ${year}`,
    description: `Verificador de hechos con inteligencia artificial para las elecciones ${name} ${year}.`,
    alternates: { canonical: `https://${config?.domain ?? "condorperu.vercel.app"}/${country}/verificador` },
  };
}

export const dynamic = "force-dynamic";

export default async function VerificadorPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [factChecks, stats] = await Promise.all([
    fetchFactChecks(50, country),
    fetchFactCheckStats(country),
  ]);

  return <VerificadorClient initialChecks={factChecks} initialStats={stats} />;
}
