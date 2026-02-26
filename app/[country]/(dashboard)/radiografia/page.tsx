import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getRadiografiasForCountry } from "@/lib/data/radiografia";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import RadiografiaIndexClient from "./radiografia-index-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/radiografia");

  return {
    title: `Radiografía de Candidatos — Análisis Profundo ${seo.name} ${seo.year}`,
    description: `Radiografía completa de los candidatos presidenciales ${seo.name} ${seo.year}. Patrimonio, procesos legales y financiamiento.`,
    keywords: getCountryKeywords(country, "radiografia"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Radiografía de Candidatos — ${seo.name} ${seo.year}`,
      description: `Análisis profundo de los candidatos: patrimonio, procesos legales y financiamiento de campaña.`,
      type: "website",
    },
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
  const radiografias = getRadiografiasForCountry(country);

  return <RadiografiaIndexClient candidates={candidates} radiografias={radiografias} />;
}
