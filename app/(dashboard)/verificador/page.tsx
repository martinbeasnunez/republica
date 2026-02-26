import type { Metadata } from "next";
import { fetchFactChecks, fetchFactCheckStats } from "@/lib/data/fact-checks";
import VerificadorClient from "./verificador-client";

export const metadata: Metadata = {
  title: "Verificador de Hechos — Fact Check Elecciones Perú 2026",
  description: "Verificador de hechos con inteligencia artificial para las elecciones Perú 2026. Verifica afirmaciones de candidatos y noticias con fuentes oficiales del JNE, ONPE e INEI.",
  alternates: { canonical: "https://condorperu.vercel.app/verificador" },
};

export const dynamic = "force-dynamic";

export default async function VerificadorPage() {
  const [factChecks, stats] = await Promise.all([
    fetchFactChecks(50),
    fetchFactCheckStats(),
  ]);

  return <VerificadorClient initialChecks={factChecks} initialStats={stats} />;
}
