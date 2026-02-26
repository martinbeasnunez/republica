import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import PilaresClient from "./pilares-client";

export const metadata: Metadata = {
  title: "Pilares del Desarrollo — Indicadores Clave Perú 2026",
  description: "Los pilares del desarrollo de Perú analizados en el contexto de las elecciones 2026. Economía, seguridad, salud, educación y cómo cada candidato aborda estos temas.",
  alternates: { canonical: "https://condorperu.vercel.app/pilares" },
};

export const dynamic = "force-dynamic";

export default async function PilaresPage() {
  const candidates = await fetchCandidates();

  return <PilaresClient candidates={candidates} />;
}
