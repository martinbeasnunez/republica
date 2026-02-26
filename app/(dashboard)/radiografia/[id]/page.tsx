import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCandidates } from "@/lib/data/candidates";
import { getRadiografia } from "@/lib/data/radiografia";
import RadiografiaDetailClient from "./radiografia-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const candidates = await fetchCandidates();
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) return { title: "Candidato no encontrado" };
  return {
    title: `Radiografía de ${candidate.name} — Análisis Completo`,
    description: `Análisis profundo de ${candidate.name} (${candidate.party}). Patrimonio declarado, trayectoria política, procesos legales y financiamiento de campaña.`,
    alternates: { canonical: `https://condorperu.vercel.app/radiografia/${id}` },
  };
}

export const dynamic = "force-dynamic";

export default async function RadiografiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidates = await fetchCandidates();

  const candidate = candidates.find((c) => c.id === id);
  const radiografia = getRadiografia(id);

  if (!candidate || !radiografia) {
    notFound();
  }

  return <RadiografiaDetailClient candidates={candidates} id={id} />;
}
