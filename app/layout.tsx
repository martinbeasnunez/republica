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
    default: "CONDOR — Inteligencia Electoral con IA | Elecciones Perú 2026",
    template: "%s | CONDOR Perú 2026",
  },
  description:
    "CONDOR analiza candidatos, verifica hechos y monitorea encuestas en tiempo real con IA. Plataforma de inteligencia electoral para las elecciones presidenciales de Perú 2026. Compara propuestas, planes de gobierno y simulaciones electorales.",
  keywords: [
    "elecciones peru 2026",
    "candidatos presidenciales peru",
    "encuestas electorales peru 2026",
    "planes de gobierno peru",
    "verificador de hechos elecciones",
    "quiz electoral peru",
    "simulador electoral peru 2026",
    "inteligencia artificial elecciones",
    "CONDOR peru",
    "voto informado peru",
    "comparar candidatos peru 2026",
    "lopez aliaga encuestas",
    "keiko fujimori 2026",
    "mapa electoral peru",
    "fact check elecciones peru",
  ],
  metadataBase: new URL("https://condorperu.vercel.app"),
  alternates: {
    canonical: "https://condorperu.vercel.app",
  },
  openGraph: {
    title: "CONDOR — Inteligencia Electoral con IA | Perú 2026",
    description:
      "Analiza candidatos, verifica hechos y monitorea encuestas con IA. La plataforma de inteligencia electoral para las elecciones Perú 2026.",
    type: "website",
    locale: "es_PE",
    siteName: "CONDOR",
    url: "https://condorperu.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CONDOR — Inteligencia Electoral con IA | Perú 2026",
    description:
      "Analiza candidatos, verifica hechos y monitorea encuestas con IA. Elecciones Perú 2026.",
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
