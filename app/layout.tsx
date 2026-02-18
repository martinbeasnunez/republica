import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
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
  title: "CONDOR — La primera eleccion con inteligencia artificial | Peru 2026",
  description:
    "CONDOR analiza candidatos, verifica hechos y monitorea noticias en tiempo real con IA. La primera plataforma de inteligencia electoral con IA para las elecciones Peru 2026.",
  keywords: [
    "Peru",
    "elecciones 2026",
    "candidatos",
    "presidente",
    "encuestas",
    "planes de gobierno",
    "condor",
    "inteligencia artificial",
    "IA",
    "fact check",
  ],
  metadataBase: new URL("https://condorperu.vercel.app"),
  openGraph: {
    title: "CONDOR — La primera eleccion con inteligencia artificial",
    description: "Analiza candidatos, verifica hechos y monitorea noticias con IA. Elecciones Peru 2026.",
    type: "website",
    locale: "es_PE",
    siteName: "CONDOR",
  },
  twitter: {
    card: "summary_large_image",
    title: "CONDOR — La primera eleccion con inteligencia artificial",
    description: "Analiza candidatos, verifica hechos y monitorea noticias con IA. Elecciones Peru 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
