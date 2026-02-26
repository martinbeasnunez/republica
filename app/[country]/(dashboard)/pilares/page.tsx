import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import PilaresClient from "./pilares-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  return {
    title: `Pilares del Desarrollo — Indicadores Clave ${name} ${year}`,
    description: `Los pilares del desarrollo de ${name} analizados en el contexto de las elecciones ${year}.`,
    alternates: { canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/pilares` },
  };
}

export const dynamic = "force-dynamic";

export default async function PilaresPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);

  return <PilaresClient candidates={candidates} />;
}
