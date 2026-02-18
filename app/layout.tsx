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
  title: "CONDOR | Elecciones Peru 2026",
  description:
    "Plataforma de inteligencia electoral para las elecciones presidenciales del Peru 2026. Candidatos, encuestas, planes de gobierno, noticias verificadas y mas.",
  keywords: [
    "Peru",
    "elecciones 2026",
    "candidatos",
    "presidente",
    "encuestas",
    "planes de gobierno",
    "condor",
  ],
  openGraph: {
    title: "CONDOR | Elecciones Peru 2026",
    description: "Inteligencia electoral en tiempo real para el Peru",
    type: "website",
    locale: "es_PE",
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
