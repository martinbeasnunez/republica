import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { EnVivoClient } from "./en-vivo-client";

export const metadata: Metadata = {
  title: "Cobertura en Vivo — Elecciones Perú 2026",
  description: "Seguimiento en vivo de las elecciones Perú 2026. Datos en tiempo real, tendencias de encuestas y noticias de última hora sobre la campaña electoral.",
  alternates: { canonical: "https://condorperu.vercel.app/en-vivo" },
};

export const dynamic = "force-dynamic";

export default async function EnVivoPage() {
  const topCandidates = await fetchTopCandidates(6);

  return <EnVivoClient topCandidates={topCandidates} />;
}
