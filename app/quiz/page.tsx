import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import QuizClient from "./quiz-client";

export const metadata: Metadata = {
  title: "¿Por Quién Votar? Quiz Electoral 2026 — Descubre tu Candidato",
  description: "¿No sabes por quién votar en las elecciones 2026? Descubre con qué candidato presidencial coincides más. Quiz de 10 preguntas: economía, seguridad, salud y más.",
  alternates: { canonical: "https://condorperu.vercel.app/quiz" },
  keywords: ["por quien votar 2026", "quiz electoral 2026", "con que candidato coincido", "elecciones 2026 quiz", "candidatos presidenciales 2026"],
};

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const candidates = await fetchCandidates();

  return <QuizClient candidates={candidates} />;
}
