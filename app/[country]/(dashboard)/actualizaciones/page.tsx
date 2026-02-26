import type { Metadata } from "next";
import ActualizacionesClient from "./actualizaciones-client";

export const metadata: Metadata = {
  title: "Changelog — Condor Perú 2026",
  description:
    "Log público de la plataforma: historial de cambios, nuevas funcionalidades y mejoras en Condor Perú 2026.",
  alternates: { canonical: "https://condorperu.vercel.app/actualizaciones" },
};

export default function ActualizacionesPage() {
  return <ActualizacionesClient />;
}
