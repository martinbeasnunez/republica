import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import MapaClient from "./mapa-client";

export const metadata: Metadata = {
  title: "Mapa Electoral — Distribución Regional Perú 2026",
  description: "Mapa electoral interactivo de Perú 2026. Visualiza la distribución regional de preferencias electorales, fuerza partidaria y demografía del voto por departamento.",
  alternates: { canonical: "https://condorperu.vercel.app/mapa" },
};

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const candidates = await fetchCandidates();

  return <MapaClient candidates={candidates} />;
}
