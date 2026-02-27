import type { Metadata } from "next";
import { getCountryConfig } from "@/lib/config/countries";
import FeedbackClient from "./feedback-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Latinoamérica";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  return {
    title: `Feedback — Condor ${name} ${year}`,
    description: `Comparte tu feedback sobre la plataforma CONDOR ${name} ${year}. Tu opinión ayuda a construir una mejor herramienta para la democracia.`,
    alternates: {
      canonical: `https://${config?.domain ?? "condorlatam.com"}/${country}/feedback`,
    },
  };
}

export default function FeedbackPage() {
  return <FeedbackClient />;
}
