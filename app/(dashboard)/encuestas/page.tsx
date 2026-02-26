import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import EncuestasClient from "./encuestas-client";

export const metadata: Metadata = {
  title: "Última Encuesta Presidencial 2026 — Intención de Voto Perú",
  description: "Última encuesta presidencial Perú 2026. López Aliaga, Keiko Fujimori, López Chau: quién lidera la intención de voto. Promedio de Ipsos, Datum, IEP y CPI actualizado.",
  alternates: { canonical: "https://condorperu.vercel.app/encuestas" },
  keywords: ["última encuesta presidencial 2026", "encuestas 2026", "encuestas presidenciales 2026", "intención de voto peru 2026", "lopez aliaga encuestas", "keiko fujimori encuestas", "lopez chau encuestas", "elecciones peru 2026"],
};

export const dynamic = "force-dynamic";

export default async function EncuestasPage() {
  const candidates = await fetchTopCandidates(8);

  return <EncuestasClient candidates={candidates} />;
}
