import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import RadiografiaIndexClient from "./radiografia-index-client";

export const metadata: Metadata = {
  title: "Radiografía de Candidatos — Análisis Profundo Perú 2026",
  description: "Radiografía completa de los candidatos presidenciales Perú 2026. Patrimonio, procesos legales, financiamiento de campaña y redes de poder.",
  alternates: { canonical: "https://condorperu.vercel.app/radiografia" },
};

export const dynamic = "force-dynamic";

export default async function RadiografiaIndexPage() {
  const candidates = await fetchCandidates();

  return <RadiografiaIndexClient candidates={candidates} />;
}
