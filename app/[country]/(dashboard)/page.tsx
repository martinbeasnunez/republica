import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import { getCountryConfig } from "@/lib/config/countries";
import HomeClient from "./home-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  return {
    title: `Elecciones ${name} ${year} — Candidatos, Encuestas y Noticias`,
    description: `Resumen rapido elecciones ${name} ${year}. ¿Quien va ganando? Conoce a los candidatos, mira las encuestas y descubre por quien votar. Informacion verificada con IA.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}` },
    openGraph: {
      title: `Elecciones ${name} ${year} — Candidatos, Encuestas y Noticias`,
      description: `¿Quien va ganando? Conoce a los candidatos, mira las encuestas y descubre por quien votar. CONDOR — Inteligencia Electoral.`,
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
