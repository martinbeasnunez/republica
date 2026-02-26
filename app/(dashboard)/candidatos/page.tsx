import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { CandidatosClient } from "./candidatos-client";

export const metadata: Metadata = {
  title: "Candidatos Presidenciales 2026 — Lista Completa y Encuestas",
  description: "Candidatos presidenciales Perú 2026: López Aliaga, Keiko Fujimori, López Chau, Forsyth, Acuña y más. Propuestas, encuestas y comparador lado a lado.",
  alternates: { canonical: "https://condorperu.vercel.app/candidatos" },
  keywords: ["candidatos presidenciales 2026", "candidatos 2026", "elecciones 2026 peru candidatos", "lopez aliaga", "keiko fujimori", "lopez chau", "candidatos elecciones peru 2026"],
};

export const dynamic = "force-dynamic";

export default async function CandidatosPage() {
  const candidates = await fetchCandidates();
  return <CandidatosClient candidates={candidates} />;
}
