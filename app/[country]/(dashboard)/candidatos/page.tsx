import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { CandidatosClient } from "./candidatos-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/candidatos");

  return {
    title: `Candidatos Presidenciales ${seo.year} — ${seo.name}`,
    description: `Candidatos presidenciales ${seo.name} ${seo.year}. Propuestas, encuestas y comparador lado a lado.`,
    keywords: getCountryKeywords(country, "candidatos"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Candidatos Presidenciales ${seo.year} — ${seo.name}`,
      description: `Todos los candidatos presidenciales de ${seo.name} ${seo.year}. Compara propuestas, encuestas e ideología.`,
      type: "website",
    },
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
