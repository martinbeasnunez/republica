import type { Metadata } from "next";
import CongresoLanding from "./congreso-landing";

export const metadata: Metadata = {
  title: "¿Qué candidatos al Congreso proponen para los emprendedores? — CONDOR Perú 2026",
  description:
    "Candidatos al Senado y Cámara de Diputados con propuestas verificadas en emprendimiento, tecnología, pymes y empleabilidad. Con instrucciones de cómo votar. Elecciones Perú 2026.",
  openGraph: {
    title: "¿Qué candidatos al Congreso proponen para los emprendedores?",
    description:
      "Candidatos al Senado y Diputados con propuestas verificadas: tecnología, pymes, formalización, crédito. Con instrucciones de cómo votar.",
    url: "https://www.condorlatam.com/pe/congreso",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Qué candidatos al Congreso proponen para los emprendedores?",
    description:
      "9 candidatos verificados al Senado y Diputados con propuestas en emprendimiento, tecnología y pymes. Elecciones Perú 2026.",
  },
};

export default function CongresoPage() {
  return <CongresoLanding />;
}
