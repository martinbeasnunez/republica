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
    default: "CONDOR — Inteligencia Electoral con IA | Elecciones LATAM",
    template: "%s | CONDOR",
  },
  description:
    "CONDOR analiza candidatos, verifica hechos y monitorea encuestas en tiempo real con IA. Plataforma de inteligencia electoral para elecciones en Latinoamérica. Compara propuestas, planes de gobierno y simulaciones electorales.",
  keywords: [
    "elecciones latinoamerica",
    "elecciones peru 2026",
    "elecciones colombia 2026",
    "candidatos presidenciales",
    "encuestas electorales",
    "planes de gobierno",
    "verificador de hechos elecciones",
    "quiz electoral",
    "simulador electoral",
    "inteligencia artificial elecciones",
    "CONDOR",
    "voto informado",
    "comparar candidatos",
    "mapa electoral",
    "fact check elecciones",
  ],
  metadataBase: new URL("https://condorperu.vercel.app"),
  alternates: {
    canonical: "https://condorperu.vercel.app",
  },
  openGraph: {
    title: "CONDOR — Inteligencia Electoral con IA",
    description:
      "Analiza candidatos, verifica hechos y monitorea encuestas con IA. Plataforma de inteligencia electoral para Latinoamérica.",
    type: "website",
    locale: "es",
    siteName: "CONDOR",
    url: "https://condorperu.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CONDOR — Inteligencia Electoral con IA",
    description:
      "Analiza candidatos, verifica hechos y monitorea encuestas con IA para elecciones en Latinoamérica.",
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
