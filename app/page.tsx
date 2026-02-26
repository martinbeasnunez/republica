import type { Metadata } from "next";
import { COUNTRIES, COUNTRY_CODES } from "@/lib/config/countries";
import { CountrySelector } from "@/components/landing/country-selector";

export const metadata: Metadata = {
  title: "CONDOR — Elige tu país | Inteligencia Electoral LATAM",
  description:
    "CONDOR es la plataforma de inteligencia electoral con IA para Latinoamérica. Selecciona tu país para comenzar.",
  alternates: { canonical: "https://condorlatam.com" },
  openGraph: {
    title: "CONDOR — Elige tu país",
    description:
      "Inteligencia electoral con IA para Latinoamérica. Analiza candidatos, verifica hechos y monitorea noticias.",
    type: "website",
  },
};

export default function CountrySelectorPage() {
  const countries = COUNTRY_CODES.map((code) => {
    const c = COUNTRIES[code];
    return {
      code: c.code,
      name: c.name,
      electionDate: c.electionDate,
      electionType: c.electionType,
      primary: c.theme.primary,
      primaryLight: c.theme.primaryLight,
    };
  });

  return <CountrySelector countries={countries} />;
}
