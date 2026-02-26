import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";
import EncuestasClient from "./encuestas-client";

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
    title: `Última Encuesta Presidencial ${year} — Intención de Voto ${name}`,
    description: `Última encuesta presidencial ${name} ${year}. Quién lidera la intención de voto. Promedio actualizado.`,
    alternates: { canonical: `https://${config?.domain ?? "condorperu.vercel.app"}/${country}/encuestas` },
  };
}

export const dynamic = "force-dynamic";

export default async function EncuestasPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchTopCandidates(8, country);

  return <EncuestasClient candidates={candidates} />;
}
