import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCandidates } from "@/lib/data/candidates";
import { getRadiografia, getRadiografiasForCountry } from "@/lib/data/radiografia";
import { getCountryConfig } from "@/lib/config/countries";
import RadiografiaDetailClient from "./radiografia-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ country: string; id: string }> }): Promise<Metadata> {
  const { country, id } = await params;
  const config = getCountryConfig(country);
  const domain = config?.domain ?? "condorlatam.com";
  const candidates = await fetchCandidates(country);
  const candidate = candidates.find((c) => c.id === id);
  const radiografia = getRadiografia(id);
  const name = candidate?.name ?? radiografia?.candidateName;
  const party = candidate?.party ?? radiografia?.candidateParty;
  if (!name) return { title: "Candidato no encontrado" };
  return {
    title: `Radiografía de ${name} — Análisis Completo`,
    description: `Análisis profundo de ${name} (${party}). Patrimonio declarado, trayectoria política y financiamiento.`,
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
  let candidates = await fetchCandidates(country);
  const radiografia = getRadiografia(id);

  if (!radiografia) {
    notFound();
  }

  // If no DB candidates, create stubs from radiografia metadata
  if (candidates.length === 0) {
    const radiografias = getRadiografiasForCountry(country);
    candidates = radiografias
      .filter((r) => r.candidateName)
      .map((r) => ({
        id: r.candidateId,
        slug: r.candidateId,
        name: r.candidateName!,
        shortName: r.candidateName!.split(" ").pop()!,
        party: r.candidateParty ?? "",
        partySlug: (r.candidateParty ?? "").toLowerCase().replace(/\s+/g, "-"),
        partyColor: r.candidatePartyColor ?? "#6366f1",
        photo: "",
        age: 0,
        profession: "",
        region: "",
        ideology: "" as "izquierda",
        bio: "",
        keyProposals: [],
        pollAverage: 0,
        pollTrend: "stable" as const,
        pollHistory: [],
        hasLegalIssues: false,
        socialMedia: {},
        quizPositions: {},
      }));
  }

  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) {
    notFound();
  }

  return <RadiografiaDetailClient candidates={candidates} id={id} />;
}
