import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { PlanesPageClient } from "./planes-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/planes");

  return {
    title: `Planes de Gobierno ${seo.year} — Propuestas de Todos los Candidatos`,
    description: `Planes de gobierno elecciones ${seo.name} ${seo.year}: propuestas de todos los candidatos. Compara por economía, seguridad, salud y educación.`,
    keywords: getCountryKeywords(country, "planes"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Planes de Gobierno ${seo.name} ${seo.year}`,
      description: `Compara los planes de gobierno de todos los candidatos presidenciales de ${seo.name} ${seo.year}.`,
      type: "website",
    },
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
