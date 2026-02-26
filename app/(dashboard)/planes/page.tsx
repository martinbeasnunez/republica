import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { PlanesPageClient } from "./planes-page-client";

export const metadata: Metadata = {
  title: "Planes de Gobierno 2026 — Propuestas de Todos los Candidatos",
  description: "Planes de gobierno elecciones 2026: propuestas de López Aliaga, Keiko Fujimori, López Chau y todos los candidatos. Compara por economía, seguridad, salud y educación.",
  alternates: { canonical: "https://condorperu.vercel.app/planes" },
  keywords: ["planes de gobierno 2026", "propuestas candidatos 2026", "elecciones peru 2026 propuestas", "lopez aliaga propuestas", "keiko fujimori plan de gobierno"],
};

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const candidates = await fetchCandidates();

  return <PlanesPageClient candidates={candidates} />;
}
