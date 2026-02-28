import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { fetchProfilesForCountry } from "@/lib/data/profiles";
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
    title: `Radiografia de Candidatos — Perfil Verificable ${seo.name} ${seo.year}`,
    description: `Perfiles verificables de los candidatos presidenciales ${seo.name} ${seo.year}. Trayectoria, controversias y situacion legal con fuentes publicas.`,
    keywords: getCountryKeywords(country, "radiografia"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Radiografia de Candidatos — ${seo.name} ${seo.year}`,
      description: `Perfiles verificables: trayectoria politica, controversias documentadas y situacion legal de cada candidato.`,
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
  const [candidates, profiles] = await Promise.all([
    fetchCandidates(country),
    fetchProfilesForCountry(country),
  ]);

  return <RadiografiaIndexClient candidates={candidates} profiles={profiles} />;
}
