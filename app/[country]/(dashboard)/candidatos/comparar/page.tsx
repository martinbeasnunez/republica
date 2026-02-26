import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { CompararClient } from "./comparar-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/candidatos/comparar");

  return {
    title: `Comparar Candidatos ${seo.year} — ${seo.name}`,
    description: `Compara candidatos presidenciales ${seo.name} ${seo.year} lado a lado. Propuestas, encuestas, ideología y plan de gobierno.`,
    keywords: getCountryKeywords(country, "comparar"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Comparar Candidatos — ${seo.name} ${seo.year}`,
      description: `Compara candidatos presidenciales ${seo.name} ${seo.year} lado a lado.`,
      type: "website",
    },
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
