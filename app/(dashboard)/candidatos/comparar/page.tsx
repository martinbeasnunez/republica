import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { CompararClient } from "./comparar-client";

export const metadata: Metadata = {
  title: "Comparar Candidatos 2026 — López Aliaga vs Keiko vs López Chau",
  description: "Compara candidatos presidenciales Perú 2026 lado a lado. López Aliaga vs Keiko Fujimori vs López Chau: propuestas, encuestas, ideología y plan de gobierno.",
  alternates: { canonical: "https://condorperu.vercel.app/candidatos/comparar" },
  keywords: ["comparar candidatos 2026", "lopez aliaga vs keiko", "candidatos presidenciales 2026 comparacion", "elecciones peru 2026"],
};

export const dynamic = "force-dynamic";

export default async function CompararPage() {
  const candidates = await fetchCandidates();

  return <CompararClient candidates={candidates} />;
}
