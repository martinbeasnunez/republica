import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Elecciones Peru 2026 — Candidatos, Encuestas y Noticias",
  description:
    "Resumen rapido elecciones Peru 2026. ¿Quien va ganando? Conoce a los candidatos, mira las encuestas y descubre por quien votar. Informacion verificada con IA.",
  alternates: { canonical: "https://condorperu.vercel.app" },
  keywords: [
    "elecciones peru 2026",
    "elecciones 2026",
    "por quien votar 2026",
    "candidatos 2026",
    "encuestas 2026",
    "ultima encuesta presidencial 2026",
    "candidatos presidenciales 2026",
    "lopez aliaga",
    "keiko fujimori",
  ],
  openGraph: {
    title: "Elecciones Peru 2026 — Candidatos, Encuestas y Noticias",
    description:
      "¿Quien va ganando? Conoce a los candidatos, mira las encuestas y descubre por quien votar. CONDOR — Inteligencia Electoral.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elecciones Peru 2026 — Candidatos, Encuestas y Noticias",
    description:
      "¿Quien va ganando? Conoce a los candidatos, encuestas y mas.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [candidates, topCandidates, articles, factChecks] = await Promise.all([
    fetchCandidates(),
    fetchTopCandidates(5),
    fetchArticles(),
    fetchFactChecks(10),
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
