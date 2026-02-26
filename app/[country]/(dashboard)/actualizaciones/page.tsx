import type { Metadata } from "next";
import { getCountryConfig } from "@/lib/config/countries";
import ActualizacionesClient from "./actualizaciones-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Latinoamérica";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  return {
    title: `Changelog — Condor ${name} ${year}`,
    description: `Log público de la plataforma: historial de cambios, nuevas funcionalidades y mejoras en Condor ${name} ${year}.`,
    alternates: {
      canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/actualizaciones`,
    },
  };
}

export default function ActualizacionesPage() {
  return <ActualizacionesClient />;
}
