import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CONDOR — Inteligencia Electoral con IA",
    short_name: "CONDOR",
    description:
      "Analiza candidatos, verifica hechos y monitorea encuestas con IA. Plataforma de inteligencia electoral para Latinoamérica.",
    start_url: "/",
    display: "standalone",
    background_color: "#08060a",
    theme_color: "#8B1A1A",
    orientation: "portrait-primary",
    categories: ["news", "politics", "education"],
    lang: "es",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
