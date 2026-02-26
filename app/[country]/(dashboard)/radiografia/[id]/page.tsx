import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCandidates } from "@/lib/data/candidates";
import { getRadiografia } from "@/lib/data/radiografia";
import { getCountryConfig } from "@/lib/config/countries";
import RadiografiaDetailClient from "./radiografia-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ country: string; id: string }> }): Promise<Metadata> {
  const { country, id } = await params;
  const config = getCountryConfig(country);
  const domain = config?.domain ?? "condorlatam.com";
  const candidates = await fetchCandidates(country);
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) return { title: "Candidato no encontrado" };
  return {
    title: `Radiografía de ${candidate.name} — Análisis Completo`,
    description: `Análisis profundo de ${candidate.name} (${candidate.party}). Patrimonio declarado, trayectoria política y financiamiento.`,
    alternates: { canonical: `https://${domain}/${country}/radiografia/${id}` },
  };
}

export const dynamic = "force-dynamic";

export default async function RadiografiaPage({
  params,
}: {
  params: Promise<{ country: string; id: string }>;
}) {
  const { country, id } = await params;
  const candidates = await fetchCandidates(country);

  const candidate = candidates.find((c) => c.id === id);
  const radiografia = getRadiografia(id);

  if (!candidate || !radiografia) {
    notFound();
  }

  return <RadiografiaDetailClient candidates={candidates} id={id} />;
}
