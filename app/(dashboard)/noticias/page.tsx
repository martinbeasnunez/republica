import type { Metadata } from "next";
import { fetchArticles } from "@/lib/data/news";
import { fetchCandidates } from "@/lib/data/candidates";
import NoticiasClient from "./noticias-client";

export const metadata: Metadata = {
  title: "Noticias Electorales — Perú 2026 en Tiempo Real",
  description: "Noticias electorales verificadas sobre las elecciones Perú 2026. Cobertura de El Comercio, RPP, La República, Infobae y más medios peruanos.",
  alternates: { canonical: "https://condorperu.vercel.app/noticias" },
};

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const [articles, candidates] = await Promise.all([
    fetchArticles(),
    fetchCandidates(),
  ]);

  return <NoticiasClient articles={articles} candidates={candidates} />;
}
