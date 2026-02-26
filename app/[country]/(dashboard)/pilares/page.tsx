import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import PilaresClient from "./pilares-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/pilares");

  return {
    title: `Pilares del Desarrollo — Indicadores Clave ${seo.name} ${seo.year}`,
    description: `Los pilares del desarrollo de ${seo.name} analizados en el contexto de las elecciones ${seo.year}. Educación, corrupción, economía y más.`,
    keywords: getCountryKeywords(country, "pilares"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Pilares del Desarrollo — ${seo.name} ${seo.year}`,
      description: `Indicadores clave de ${seo.name}: educación, corrupción, economía, salud y seguridad.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PilaresPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <PilaresClient candidates={candidates} />;
}
