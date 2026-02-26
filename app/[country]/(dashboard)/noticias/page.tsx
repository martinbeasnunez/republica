import type { Metadata } from "next";
import { fetchArticles } from "@/lib/data/news";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import NoticiasClient from "./noticias-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/noticias");

  return {
    title: `Noticias Electorales — ${seo.name} ${seo.year} en Tiempo Real`,
    description: `Noticias electorales verificadas sobre las elecciones ${seo.name} ${seo.year}. Última hora y análisis con IA.`,
    keywords: getCountryKeywords(country, "noticias"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Noticias Elecciones ${seo.name} ${seo.year}`,
      description: `Noticias electorales verificadas sobre las elecciones ${seo.name} ${seo.year}. Análisis con inteligencia artificial.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function NoticiasPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [articles, candidates] = await Promise.all([
    fetchArticles(country),
    fetchCandidates(country),
  ]);

  return <NoticiasClient articles={articles} candidates={candidates} />;
}
