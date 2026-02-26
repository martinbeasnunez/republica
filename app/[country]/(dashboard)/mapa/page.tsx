import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import MapaClient from "./mapa-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/mapa");

  return {
    title: `Mapa Electoral — Distribución Regional ${seo.name} ${seo.year}`,
    description: `Mapa electoral interactivo de ${seo.name} ${seo.year}. Distribución regional de preferencias electorales.`,
    keywords: getCountryKeywords(country, "mapa"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Mapa Electoral ${seo.name} ${seo.year}`,
      description: `Mapa electoral interactivo de ${seo.name} ${seo.year}. Explora preferencias por región.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function MapaPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <MapaClient candidates={candidates} />;
}
