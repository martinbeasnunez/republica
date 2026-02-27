import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  ElectionJsonLd,
} from "@/components/seo/json-ld";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CONDOR — Inteligencia Electoral con IA | Elecciones Perú y Colombia 2026",
    template: "%s | CONDOR",
  },
  description:
    "Plataforma de inteligencia electoral con IA para Perú y Colombia 2026. Encuestas en tiempo real, verificador de hechos, quiz electoral, simulador de escenarios, comparador de candidatos y análisis de planes de gobierno. Todo en un solo lugar.",
  keywords: [
    "elecciones peru 2026",
    "elecciones colombia 2026",
    "candidatos presidenciales peru 2026",
    "candidatos presidenciales colombia 2026",
    "encuestas electorales peru",
    "encuestas electorales colombia",
    "encuestas peru 2026",
    "encuestas colombia 2026",
    "por quien votar peru 2026",
    "por quien votar colombia 2026",
    "quiz electoral 2026",
    "comparar candidatos peru",
    "comparar candidatos colombia",
    "verificador de hechos elecciones",
    "fact check elecciones",
    "planes de gobierno peru 2026",
    "planes de gobierno colombia 2026",
    "simulador electoral 2026",
    "quien va ganando encuestas peru",
    "quien va ganando encuestas colombia",
    "primera vuelta peru 2026",
    "primera vuelta colombia 2026",
    "mapa electoral peru",
    "mapa electoral colombia",
    "propuestas candidatos peru 2026",
    "propuestas candidatos colombia 2026",
    "voto informado 2026",
    "CONDOR",
    "inteligencia artificial elecciones",
    "elecciones latinoamerica 2026",
  ],
  metadataBase: new URL("https://condorlatam.com"),
  alternates: {
    canonical: "https://condorlatam.com",
    languages: {
      "es-PE": "https://condorlatam.com/pe",
      "es-CO": "https://condorlatam.com/co",
      "x-default": "https://condorlatam.com/pe",
    },
  },
  openGraph: {
    title: "CONDOR — Inteligencia Electoral con IA | Perú y Colombia 2026",
    description:
      "Encuestas, verificador de hechos, quiz electoral, simulador, comparador de candidatos y más. La plataforma más completa para las elecciones 2026.",
    type: "website",
    locale: "es_ES",
    siteName: "CONDOR",
    url: "https://condorlatam.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "CONDOR — Inteligencia Electoral con IA",
    description:
      "Encuestas, fact-check, quiz electoral, simulador y más para elecciones Perú y Colombia 2026.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "politics",
  verification: {
    google: "PWbiCsuWmckjsI3vwzjJdumPPSjTPLZUBd6D4g_dASI",
  },
  other: {
    "theme-color": "#8B1A1A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <ElectionJsonLd />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
