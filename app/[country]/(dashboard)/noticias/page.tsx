import type { Metadata } from "next";
import { fetchArticles } from "@/lib/data/news";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import NoticiasClient from "./noticias-client";

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
    title: `Noticias Electorales — ${name} ${year} en Tiempo Real`,
    description: `Noticias electorales verificadas sobre las elecciones ${name} ${year}.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/noticias` },
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
