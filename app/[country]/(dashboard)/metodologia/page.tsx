import type { Metadata } from "next";
import MetodologiaClient from "./metodologia-client";
import { FAQPageJsonLd } from "@/components/seo/json-ld";
import { getCountryConfig } from "@/lib/config/countries";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Latinoamérica";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const domain = config?.domain ?? "condorlatam.com";

  return {
    title: "Metodología y Fuentes — Transparencia CONDOR",
    description: `Conoce la metodología de CONDOR: cómo agregamos encuestas, verificamos hechos y analizamos candidatos para las elecciones ${name} ${year}.`,
    alternates: { canonical: `https://${domain}/${country}/metodologia` },
  };
}

function getFaqQuestions(isColombia: boolean) {
  return [
    {
      question: "¿Cómo se calculan los promedios de encuestas en CONDOR?",
      answer:
        "Recopilamos encuestas de las principales encuestadoras registradas. Calculamos un promedio ponderado donde el peso depende de confiabilidad histórica, tamaño de muestra, recencia y metodología.",
    },
    {
      question: "¿Qué fuentes usa el verificador de hechos?",
      answer:
        "El verificador cruza afirmaciones contra bases de datos oficiales de las autoridades electorales y medios verificados del país correspondiente.",
    },
    {
      question: isColombia
        ? "¿Cómo funciona el análisis de escenarios?"
        : "¿Cómo funciona el simulador electoral?",
      answer: isColombia
        ? "Ejecutamos análisis de escenarios con modelos Monte Carlo (hasta 10,000 iteraciones) basados en promedios de encuestas, volatilidad histórica, porcentaje de indecisos y variación de participación."
        : "Ejecutamos simulaciones Monte Carlo (hasta 10,000 iteraciones) basadas en promedios de encuestas, volatilidad histórica, porcentaje de indecisos y variación de participación.",
    },
    {
      question: "¿CONDOR favorece a algún candidato?",
      answer:
        "No. CONDOR es imparcial. Presentamos datos objetivos de fuentes oficiales para que el ciudadano decida informado. No promovemos ningún candidato o partido político.",
    },
    {
      question: "¿Con qué frecuencia se actualizan los datos?",
      answer:
        "Las encuestas y noticias se actualizan diariamente mediante procesos automatizados. Las verificaciones de hechos se generan cada 24 horas a partir de noticias recientes.",
    },
  ];
}

export default async function MetodologiaPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const isColombia = country === "co";
  const questions = getFaqQuestions(isColombia);

  return (
    <>
      <FAQPageJsonLd questions={questions} />
      <MetodologiaClient />
    </>
  );
}
