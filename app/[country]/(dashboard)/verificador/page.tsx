import type { Metadata } from "next";
import { fetchFactChecks, fetchFactCheckStats } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import VerificadorClient from "./verificador-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/verificador");

  return {
    title: `Verificador de Hechos — Fact Check Elecciones ${seo.name} ${seo.year}`,
    description: `Verificador de hechos con inteligencia artificial para las elecciones ${seo.name} ${seo.year}. ¿Es verdad o mentira?`,
    keywords: getCountryKeywords(country, "verificador"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Verificador de Hechos — Elecciones ${seo.name} ${seo.year}`,
      description: `¿Es verdad o mentira? Verificador de hechos con IA para las elecciones ${seo.name} ${seo.year}.`,
      type: "website",
    },
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
