import type { Metadata } from "next";
import MetodologiaClient from "./metodologia-client";
import { FAQPageJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Metodología y Fuentes — Transparencia CONDOR",
  description:
    "Conoce la metodología de CONDOR: cómo agregamos encuestas, verificamos hechos y analizamos candidatos para las elecciones Perú 2026. Fuentes oficiales: JNE, ONPE, Ipsos, Datum, IEP.",
  alternates: { canonical: "https://condorperu.vercel.app/metodologia" },
};

const FAQ_QUESTIONS = [
  {
    question: "¿Cómo se calculan los promedios de encuestas en CONDOR?",
    answer:
      "Recopilamos encuestas de Ipsos, CPI, Datum e IEP registradas ante el JNE. Calculamos un promedio ponderado donde el peso depende de confiabilidad histórica, tamaño de muestra, recencia y metodología.",
  },
  {
    question: "¿Qué fuentes usa el verificador de hechos?",
    answer:
      "El verificador cruza afirmaciones contra bases de datos oficiales del JNE, ONPE, RENIEC e INEI, además de fuentes verificadas como Ojo Público y Convoca.",
  },
  {
    question: "¿Cómo funciona el simulador electoral?",
    answer:
      "Ejecutamos simulaciones Monte Carlo (hasta 10,000 iteraciones) basadas en promedios de encuestas, volatilidad histórica, porcentaje de indecisos y variación de participación.",
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

export default function MetodologiaPage() {
  return (
    <>
      <FAQPageJsonLd questions={FAQ_QUESTIONS} />
      <MetodologiaClient />
    </>
  );
}
