import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCandidateBySlug } from "@/lib/data/candidates";
import { CandidateProfileClient } from "./candidate-profile-client";
import { CandidateJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";
import { IDEOLOGY_LABELS } from "@/lib/data/candidates";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await fetchCandidateBySlug(slug);
  if (!candidate) return { title: "Candidato no encontrado" };

  const name = candidate.name;
  const party = candidate.party;
  const poll = candidate.pollAverage;
  const trend = candidate.pollTrend === "up" ? "sube" : candidate.pollTrend === "down" ? "baja" : "estable";

  return {
    title: `${name} — Encuestas, Propuestas y Plan de Gobierno 2026`,
    description: `Todo sobre ${name} (${party}) candidato presidencial Perú 2026. Última encuesta: ${poll}% (${trend}). Propuestas, plan de gobierno, trayectoria y comparación con otros candidatos.`,
    alternates: { canonical: `https://condorperu.vercel.app/candidatos/${slug}` },
    keywords: [
      name.toLowerCase(),
      `${name.toLowerCase()} encuestas`,
      `${name.toLowerCase()} propuestas`,
      `${name.toLowerCase()} plan de gobierno`,
      `${name.toLowerCase()} candidato 2026`,
      `${party.toLowerCase()} elecciones 2026`,
      "candidatos presidenciales 2026",
      "elecciones peru 2026",
      "encuestas presidenciales 2026",
    ],
    openGraph: {
      title: `${name} — Encuestas ${poll}% | Elecciones Perú 2026`,
      description: `Perfil completo de ${name} (${party}). Encuestas: ${poll}% y ${trend}. Propuestas, plan de gobierno y análisis con IA.`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Encuestas y Propuestas 2026`,
      description: `${name} (${party}): ${poll}% intención de voto. Propuestas, plan de gobierno y más.`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const candidate = await fetchCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

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
      />
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: "https://condorperu.vercel.app" },
          { name: "Candidatos", url: "https://condorperu.vercel.app/candidatos" },
          { name: candidate.name, url: `https://condorperu.vercel.app/candidatos/${slug}` },
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
              question: `¿Cuánto tiene ${name} en las encuestas 2026?`,
              answer: `Según el promedio de encuestadoras (Ipsos, Datum, IEP, CPI), ${name} del partido ${party} tiene ${poll}% de intención de voto. Su tendencia actual es ${trend}.`,
            },
            {
              question: `¿Cuáles son las propuestas de ${name}?`,
              answer: `Las principales propuestas de ${name} (${party}) incluyen: ${proposals}. Consulta su perfil completo en CONDOR para ver todas sus propuestas y plan de gobierno.`,
            },
            {
              question: `¿De qué partido es ${name}?`,
              answer: `${name} es candidato presidencial por el partido ${party}. Su orientación política es de ${ideology}.`,
            },
            {
              question: `¿Qué edad tiene ${name} y de dónde es?`,
              answer: `${name} tiene ${candidate.age} años, es ${candidate.profession.toLowerCase()} y es natural de ${candidate.region}, Perú.`,
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
