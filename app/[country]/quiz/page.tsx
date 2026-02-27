import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { isValidCountry, getCountryConfig } from "@/lib/config/countries";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
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
    title: `¿Por Quién Votar en ${seo.name} ${seo.year}? Quiz Electoral — Descubre tu Candidato`,
    description: `¿No sabes por quién votar en las elecciones de ${seo.name} ${seo.year}? Resuelve 10 preguntas y descubre qué candidato presidencial es más afín a tus ideas. Quiz gratuito con IA.`,
    keywords: getCountryKeywords(country, "quiz"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `¿No sabes por quién votar en ${seo.name}? Resuelve este quiz`,
      description: `10 preguntas → ranking personalizado de candidatos ${seo.year}. Descubre con quién coincides más.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `¿No sabes por quién votar en ${seo.name}? Resuelve este quiz`,
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
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  const faqQuestions = [
    {
      question: `¿Cómo funciona el Quiz Electoral de CONDOR?`,
      answer: `El quiz consta de 10 preguntas sobre temas clave como economía, seguridad, educación, salud y derechos. Según tus respuestas, nuestro algoritmo calcula un porcentaje de compatibilidad con cada candidato presidencial de ${name} ${year} y te muestra un ranking personalizado.`,
    },
    {
      question: `¿El quiz electoral es confiable para decidir mi voto?`,
      answer: `El quiz es una herramienta orientativa basada en las posiciones públicas de los candidatos. Te ayuda a descubrir afinidades, pero recomendamos complementarlo revisando los perfiles completos, planes de gobierno y el verificador de hechos de CONDOR antes de tomar tu decisión.`,
    },
    {
      question: `¿Por quién votar en ${name} ${year}?`,
      answer: `La decisión del voto es personal. CONDOR ofrece herramientas para un voto informado: quiz electoral para descubrir afinidades, comparador de candidatos, encuestas actualizadas, verificador de hechos y análisis de planes de gobierno. Usa todas estas herramientas para tomar la mejor decisión.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://condorlatam.com/${country}` },
          { name: "Quiz Electoral", url: `https://condorlatam.com/${country}/quiz` },
        ]}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <QuizClient candidates={candidates} />
    </>
  );
}
