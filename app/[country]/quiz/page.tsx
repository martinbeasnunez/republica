import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { isValidCountry } from "@/lib/config/countries";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import QuizClient from "./quiz-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/quiz");

  return {
    title: `¿Por Quién Votar? Quiz Electoral ${seo.year} ${seo.name} — Descubre tu Candidato`,
    description: `Resuelve este test de 10 preguntas y te damos un ranking con los candidatos presidenciales de ${seo.name} ${seo.year} más afines a ti. Descubre con quién coincides.`,
    keywords: getCountryKeywords(country, "quiz"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `¿No sabes por quién votar en ${seo.name}? Resuelve este test`,
      description: `10 preguntas → ranking personalizado de candidatos ${seo.year}. Descubre con quién coincides más.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `¿No sabes por quién votar en ${seo.name}? Resuelve este test`,
      description: `10 preguntas → ranking personalizado de candidatos ${seo.year}. Descubre con quién coincides más.`,
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
