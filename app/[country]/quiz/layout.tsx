"use client";

import { useParams, notFound } from "next/navigation";
import { CountryProvider } from "@/lib/config/country-context";
import { isValidCountry, type CountryCode } from "@/lib/config/countries";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ country: string }>();
  const country = params.country;

  if (!isValidCountry(country)) {
    notFound();
  }

  return (
    <CountryProvider country={country as CountryCode}>
      {children}
    </CountryProvider>
  );
}
