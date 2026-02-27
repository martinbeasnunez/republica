import type { Metadata } from "next";
import { fetchFactChecks, fetchFactCheckStats } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { getCountryConfig } from "@/lib/config/countries";
import {
  FAQPageJsonLd,
  BreadcrumbJsonLd,
  ClaimReviewJsonLd,
} from "@/components/seo/json-ld";
import VerificadorClient from "./verificador-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/verificador");

  return {
    title: `Verificador de Hechos Elecciones ${seo.name} ${seo.year} — Fact Check con IA`,
    description: `¿Verdadero o falso? Verificador de hechos con IA para elecciones ${seo.name} ${seo.year}. Fact-check automático de afirmaciones de candidatos y noticias electorales. Actualizado cada 4 horas.`,
    keywords: getCountryKeywords(country, "verificador"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Verificador de Hechos — Elecciones ${seo.name} ${seo.year}`,
      description: `¿Verdadero o falso? Fact-check con IA de afirmaciones electorales en ${seo.name} ${seo.year}.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function VerificadorPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [factChecks, stats] = await Promise.all([
    fetchFactChecks(50, country),
    fetchFactCheckStats(country),
  ]);

  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  const faqQuestions = [
    {
      question: `¿Cómo funciona el verificador de hechos de CONDOR?`,
      answer: `CONDOR utiliza inteligencia artificial para analizar automáticamente afirmaciones de candidatos y noticias electorales. El sistema clasifica cada afirmación como Verdadero, Falso, Engañoso, Parcialmente Verdadero o No Verificable, citando las fuentes consultadas.`,
    },
    {
      question: `¿Cada cuánto se actualizan las verificaciones?`,
      answer: `El verificador de hechos se ejecuta automáticamente cada 4 horas. Analiza las noticias electorales más recientes, extrae afirmaciones verificables y genera fact-checks con explicación y fuentes. Actualmente hay ${stats?.total ?? "50+"} verificaciones realizadas para ${name}.`,
    },
    {
      question: `¿Es confiable un verificador de hechos con IA?`,
      answer: `CONDOR es una herramienta de apoyo, no un sustituto del juicio crítico. Cada verificación incluye las fuentes consultadas y el nivel de confianza del sistema. Recomendamos siempre consultar múltiples fuentes. Nuestra metodología es transparente y está disponible en la sección de Metodología.`,
    },
  ];

  // Generate ClaimReview schema for the latest 3 fact checks (Google rich results)
  const latestChecks = (factChecks ?? []).slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://condorlatam.com/${country}` },
          {
            name: "Verificador de Hechos",
            url: `https://condorlatam.com/${country}/verificador`,
          },
        ]}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      {latestChecks.map((fc) => (
        <ClaimReviewJsonLd
          key={fc.id}
          claim={fc.claim}
          verdict={fc.verdict}
          explanation={fc.explanation ?? ""}
          url={`https://condorlatam.com/${country}/verificador`}
          datePublished={fc.createdAt ?? new Date().toISOString()}
          countryCode={country === "co" ? "co" : "pe"}
        />
      ))}
      <VerificadorClient initialChecks={factChecks} initialStats={stats} />
    </>
  );
}
