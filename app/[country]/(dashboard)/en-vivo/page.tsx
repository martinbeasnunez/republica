import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { EnVivoClient } from "./en-vivo-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/en-vivo");

  return {
    title: `Cobertura en Vivo — Elecciones ${seo.name} ${seo.year}`,
    description: `Seguimiento en vivo de las elecciones ${seo.name} ${seo.year}. Datos en tiempo real y tendencias de encuestas.`,
    keywords: getCountryKeywords(country, "en-vivo"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `En Vivo — Elecciones ${seo.name} ${seo.year}`,
      description: `Cobertura en tiempo real de las elecciones ${seo.name} ${seo.year}.`,
      type: "website",
    },
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
