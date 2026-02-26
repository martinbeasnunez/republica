import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCandidateBySlug } from "@/lib/data/candidates";
import { CandidateProfileClient } from "./candidate-profile-client";
import { CandidateJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";
import { IDEOLOGY_LABELS } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";

export async function generateMetadata({ params }: { params: Promise<{ country: string; slug: string }> }): Promise<Metadata> {
  const { country, slug } = await params;
  const config = getCountryConfig(country);
  const domain = config?.domain ?? "condorperu.vercel.app";
  const countryName = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const candidate = await fetchCandidateBySlug(slug, country);
  if (!candidate) return { title: "Candidato no encontrado" };

  const name = candidate.name;
  const party = candidate.party;
  const poll = candidate.pollAverage;
  const trend = candidate.pollTrend === "up" ? "sube" : candidate.pollTrend === "down" ? "baja" : "estable";

  return {
    title: `${name} — Encuestas, Propuestas y Plan de Gobierno ${year}`,
    description: `Todo sobre ${name} (${party}) candidato presidencial ${countryName} ${year}. Última encuesta: ${poll}% (${trend}).`,
    alternates: { canonical: `https://${domain}/${country}/candidatos/${slug}` },
    openGraph: {
      title: `${name} — Encuestas ${poll}% | Elecciones ${countryName} ${year}`,
      description: `Perfil completo de ${name} (${party}). Encuestas: ${poll}% y ${trend}. Propuestas y análisis con IA.`,
      type: "profile",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  const candidate = await fetchCandidateBySlug(slug, country);

  if (!candidate) {
    notFound();
  }

  const config = getCountryConfig(country);
  const domain = config?.domain ?? "condorperu.vercel.app";
  const countryName = config?.name ?? "Perú";

  return (
    <>
      <CandidateJsonLd
        name={candidate.name}
        party={candidate.party}
        age={candidate.age}
        profession={candidate.profession}
        region={candidate.region}
        bio={candidate.bio}
        slug={candidate.slug}
        photo={candidate.photo}
        pollAverage={candidate.pollAverage}
        countryCode={country as "pe" | "co"}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://${domain}` },
          { name: "Candidatos", url: `https://${domain}/${country}/candidatos` },
          { name: candidate.name, url: `https://${domain}/${country}/candidatos/${slug}` },
        ]}
      />
      <FAQPageJsonLd
        questions={(() => {
          const name = candidate.name;
          const party = candidate.party;
          const poll = candidate.pollAverage;
          const trend = candidate.pollTrend === "up" ? "subiendo" : candidate.pollTrend === "down" ? "bajando" : "estable";
          const ideology = IDEOLOGY_LABELS[candidate.ideology]?.es ?? candidate.ideology;
          const proposals = candidate.keyProposals.slice(0, 3).map((p) => p.title).join(", ");

          const faqs = [
            {
              question: `¿Cuánto tiene ${name} en las encuestas?`,
              answer: `Según el promedio de encuestadoras, ${name} del partido ${party} tiene ${poll}% de intención de voto. Su tendencia actual es ${trend}.`,
            },
            {
              question: `¿Cuáles son las propuestas de ${name}?`,
              answer: `Las principales propuestas de ${name} (${party}) incluyen: ${proposals}. Consulta su perfil completo en CONDOR.`,
            },
            {
              question: `¿De qué partido es ${name}?`,
              answer: `${name} es candidato presidencial por el partido ${party}. Su orientación política es de ${ideology}.`,
            },
            {
              question: `¿Qué edad tiene ${name} y de dónde es?`,
              answer: `${name} tiene ${candidate.age} años, es ${candidate.profession.toLowerCase()} y es natural de ${candidate.region}, ${countryName}.`,
            },
          ];

          if (candidate.hasLegalIssues && candidate.legalNote) {
            faqs.push({
              question: `¿${name} tiene problemas legales?`,
              answer: `Sí. ${candidate.legalNote}`,
            });
          }

          return faqs;
        })()}
      />
      <CandidateProfileClient candidate={candidate} />
    </>
  );
}
