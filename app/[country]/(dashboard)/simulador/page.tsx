import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import { getCountrySeo } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SimuladorClient } from "./simulador-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const seo = getCountrySeo(country, "/simulador");
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const isColombia = country === "co";

  return {
    title: isColombia
      ? `Análisis de Escenarios Electorales Colombia ${year} — Proyecciones con IA`
      : `Simulador Electoral Perú ${year} — Quién Gana según Monte Carlo`,
    description: isColombia
      ? `Análisis de escenarios electorales Colombia ${year} con 10,000 simulaciones Monte Carlo. Probabilidades de cada candidato basadas en encuestas reales de Invamer, Guarumo, CELAG y más.`
      : `Simulador electoral Perú ${year} con 10,000 simulaciones Monte Carlo. ¿Quién gana la primera vuelta? Probabilidades basadas en encuestas de Ipsos, Datum, CPI e IEP.`,
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: isColombia
        ? `Escenarios Electorales Colombia ${year}`
        : `Simulador Electoral Perú ${year} — ¿Quién gana?`,
      description: `10,000 simulaciones Monte Carlo basadas en encuestas reales. Probabilidades de cada candidato para ${name} ${year}.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function SimuladorPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  const faqQuestions = [
    {
      question: `¿Cómo funciona el simulador electoral de CONDOR?`,
      answer: `CONDOR ejecuta 10,000 simulaciones Monte Carlo basadas en los promedios actuales de encuestas. Cada simulación varía la participación electoral (0-40%), la volatilidad de los indecisos y el margen de error de las encuestas para generar probabilidades realistas de victoria para cada candidato.`,
    },
    {
      question: `¿Quién tiene más probabilidad de ganar las elecciones en ${name} ${year}?`,
      answer: `Las probabilidades se calculan dinámicamente basadas en las encuestas más recientes. Usa el simulador en condorlatam.com/${country}/simulador para ver las probabilidades actualizadas de cada candidato con diferentes escenarios de participación e indecisos.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://condorlatam.com/${country}` },
          {
            name: country === "co" ? "Análisis de Escenarios" : "Simulador Electoral",
            url: `https://condorlatam.com/${country}/simulador`,
          },
        ]}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <SimuladorClient candidates={candidates} />
    </>
  );
}
