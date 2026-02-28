import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCandidates } from "@/lib/data/candidates";
import { fetchCandidateProfile } from "@/lib/data/profiles";
import { getCountryConfig } from "@/lib/config/countries";
import RadiografiaDetailClient from "./radiografia-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; id: string }>;
}): Promise<Metadata> {
  const { country, id } = await params;
  const config = getCountryConfig(country);
  const domain = config?.domain ?? "condorlatam.com";
  const candidates = await fetchCandidates(country);
  const candidate = candidates.find((c) => c.id === id);
  const name = candidate?.name;
  const party = candidate?.party;
  if (!name) return { title: "Candidato no encontrado" };
  return {
    title: `Radiografia de ${name} — Perfil Verificable`,
    description: `Perfil verificable de ${name} (${party}). Trayectoria politica, controversias documentadas y situacion legal.`,
    alternates: {
      canonical: `https://${domain}/${country}/radiografia/${id}`,
    },
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

  if (!candidate) {
    notFound();
  }

  const profile = await fetchCandidateProfile(id);

  return (
    <RadiografiaDetailClient candidate={candidate} profile={profile} />
  );
}
