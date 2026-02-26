import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import HomeClient from "./home-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country);

  return {
    title: `Elecciones ${seo.name} ${seo.year} — Candidatos, Encuestas y Noticias`,
    description: `Resumen rápido elecciones ${seo.name} ${seo.year}. ¿Quién va ganando? Conoce a los candidatos, mira las encuestas y descubre por quién votar. Información verificada con IA.`,
    keywords: getCountryKeywords(country, "home"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Elecciones ${seo.name} ${seo.year} — Candidatos, Encuestas y Noticias`,
      description: `¿Quién va ganando? Conoce a los candidatos, mira las encuestas y descubre por quién votar. CONDOR — Inteligencia Electoral.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;

  const [candidates, topCandidates, articles, factChecks] = await Promise.all([
    fetchCandidates(country),
    fetchTopCandidates(5, country),
    fetchArticles(country),
    fetchFactChecks(10, country),
  ]);

  return (
    <HomeClient
      candidates={candidates}
      topCandidates={topCandidates}
      articles={articles}
      factChecks={factChecks}
    />
  );
}
