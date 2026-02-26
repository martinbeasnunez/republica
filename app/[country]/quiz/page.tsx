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
    description: `Resuelve este test de 10 preguntas y te damos un ranking con los candidatos presidenciales de ${name} ${year} más afines a ti. Descubre con quién coincides.`,
    alternates: { canonical: `https://condorlatam.com/${country}/quiz` },
    keywords: [
      `por quien votar ${year} ${name.toLowerCase()}`,
      `quiz electoral ${year}`,
      `con que candidato coincido`,
      `elecciones ${year} ${name.toLowerCase()} quiz`,
      `candidatos presidenciales ${year} ${name.toLowerCase()}`,
      `test electoral ${name.toLowerCase()}`,
    ],
    openGraph: {
      title: `¿No sabes por quién votar en ${name}? Resuelve este test`,
      description: `10 preguntas → ranking personalizado de candidatos ${year}. Descubre con quién coincides más.`,
      url: `https://condorlatam.com/${country}/quiz`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `¿No sabes por quién votar en ${name}? Resuelve este test`,
      description: `10 preguntas → ranking personalizado de candidatos ${year}. Descubre con quién coincides más.`,
    },
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
