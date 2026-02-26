import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { isValidCountry } from "@/lib/config/countries";
import { notFound } from "next/navigation";
import QuizClient from "./quiz-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const name = country === "co" ? "Colombia" : "Perú";
  const year = country === "co" ? "2026" : "2026";

  return {
    title: `¿Por Quién Votar? Quiz Electoral ${year} ${name} — Descubre tu Candidato`,
    description: `¿No sabes por quién votar en las elecciones ${year} de ${name}? Descubre con qué candidato presidencial coincides más. Quiz de 10 preguntas.`,
    alternates: { canonical: `https://condorlatam.com/${country}/quiz` },
    keywords: [
      `por quien votar ${year} ${name.toLowerCase()}`,
      `quiz electoral ${year}`,
      `con que candidato coincido`,
      `elecciones ${year} ${name.toLowerCase()} quiz`,
      `candidatos presidenciales ${year} ${name.toLowerCase()}`,
    ],
  };
}

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;

  if (!isValidCountry(country)) {
    notFound();
  }

  const candidates = await fetchCandidates(country);

  return <QuizClient candidates={candidates} />;
}
