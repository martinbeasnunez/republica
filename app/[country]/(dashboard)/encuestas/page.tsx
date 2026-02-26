import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import EncuestasClient from "./encuestas-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/encuestas");

  return {
    title: `Última Encuesta Presidencial ${seo.year} — Intención de Voto ${seo.name}`,
    description: `Última encuesta presidencial ${seo.name} ${seo.year}. Quién lidera la intención de voto. Promedio actualizado.`,
    keywords: getCountryKeywords(country, "encuestas"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Encuestas ${seo.name} ${seo.year} — ¿Quién va ganando?`,
      description: `Promedio actualizado de encuestas presidenciales ${seo.name} ${seo.year}. Intención de voto y tendencias.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function EncuestasPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchTopCandidates(8, country);

  return <EncuestasClient candidates={candidates} />;
}
