/**
 * JSON-LD Structured Data Components for SEO
 * Provides Organization, WebSite, Person, FAQPage, and BreadcrumbList schemas
 * Country-aware for multi-country support
 */

import { getCountryConfig, type CountryCode } from "@/lib/config/countries";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://condorlatam.com";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CONDOR",
    alternateName: "CONDOR — Inteligencia Electoral con IA",
    url: BASE_URL,
    logo: `${BASE_URL}/icon`,
    description:
      "Plataforma de inteligencia electoral con IA para elecciones en Latinoamérica. Análisis de candidatos, verificación de hechos y monitoreo de noticias en tiempo real.",
    foundingDate: "2025",
    areaServed: [
      { "@type": "Country", name: "Perú" },
      { "@type": "Country", name: "Colombia" },
    ],
    knowsAbout: [
      "Elecciones latinoamericanas",
      "Candidatos presidenciales",
      "Encuestas electorales",
      "Verificación de hechos",
      "Inteligencia artificial electoral",
    ],
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CONDOR",
    alternateName: "CONDOR — Inteligencia Electoral con IA",
    url: BASE_URL,
    description:
      "Plataforma de inteligencia electoral con IA para Latinoamérica.",
    inLanguage: "es",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/{country}/candidatos?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CandidateJsonLdProps {
  name: string;
  party: string;
  age: number;
  profession: string;
  region: string;
  bio: string;
  slug: string;
  photo: string;
  pollAverage: number;
  countryCode?: CountryCode;
}

export function CandidateJsonLd({
  name,
  party,
  age,
  profession,
  region,
  bio,
  slug,
  photo,
  pollAverage,
  countryCode = "pe",
}: CandidateJsonLdProps) {
  const config = getCountryConfig(countryCode)!;
  const year = config.electionDate.slice(0, 4);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: `Candidato presidencial - ${party}`,
    description: bio,
    url: `${BASE_URL}/${countryCode}/candidatos/${slug}`,
    image: photo.startsWith("http") ? photo : photo.startsWith("/") ? `${BASE_URL}${photo}` : `${BASE_URL}/candidatos/${photo}`,
    birthPlace: {
      "@type": "Place",
      name: region,
    },
    affiliation: {
      "@type": "PoliticalParty",
      name: party,
    },
    knowsAbout: [profession, `Política de ${config.name}`, `Elecciones ${config.name} ${year}`],

  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ElectionJsonLd({ countryCode = "pe" }: { countryCode?: CountryCode }) {
  const config = getCountryConfig(countryCode)!;
  const year = config.electionDate.slice(0, 4);

  // Electoral bodies for the country
  const organizer = config.electoralBodies[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${config.electionType} ${config.name} ${year}`,
    description: `${config.electionType} de ${config.name} ${year}.`,
    startDate: config.electionDate,
    endDate: config.electionDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Country",
      name: config.nameEn,
      address: {
        "@type": "PostalAddress",
        addressCountry: config.code.toUpperCase(),
      },
    },
    organizer: {
      "@type": "Organization",
      name: organizer?.name || `Organismo Electoral de ${config.name}`,
    },
    about: {
      "@type": "GovernmentService",
      name: "Elecciones presidenciales",
      serviceType: "Votación",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQPageJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * ClaimReview schema — enables Google's Fact Check rich results.
 * See: https://developers.google.com/search/docs/data-types/factcheck
 */
interface ClaimReviewJsonLdProps {
  claim: string;
  verdict: string;
  explanation: string;
  url: string;
  datePublished: string;
  countryCode?: CountryCode;
}

export function ClaimReviewJsonLd({
  claim,
  verdict,
  explanation,
  url,
  datePublished,
  countryCode = "pe",
}: ClaimReviewJsonLdProps) {
  // Map internal verdicts to schema.org alternateName ratings
  const ratingMap: Record<string, { name: string; best: number; worst: number; value: number }> = {
    VERDADERO: { name: "Verdadero", best: 5, worst: 1, value: 5 },
    PARCIALMENTE_VERDADERO: { name: "Parcialmente verdadero", best: 5, worst: 1, value: 3 },
    ENGANOSO: { name: "Engañoso", best: 5, worst: 1, value: 2 },
    FALSO: { name: "Falso", best: 5, worst: 1, value: 1 },
    NO_VERIFICABLE: { name: "No verificable", best: 5, worst: 1, value: 0 },
  };

  const rating = ratingMap[verdict] ?? ratingMap.NO_VERIFICABLE;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url,
    claimReviewed: claim,
    author: {
      "@type": "Organization",
      name: "CONDOR",
      url: BASE_URL,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating.value,
      bestRating: rating.best,
      worstRating: rating.worst,
      alternateName: rating.name,
    },
    itemReviewed: {
      "@type": "Claim",
      author: {
        "@type": "Organization",
        name: `Fuentes electorales de ${getCountryConfig(countryCode)?.name ?? "Perú"}`,
      },
      datePublished,
      appearance: {
        "@type": "CreativeWork",
        url,
      },
    },
    datePublished,
    reviewBody: explanation,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * ItemList schema — for pages that list items (candidatos, encuestas, etc.)
 * Enables Google's rich list snippets.
 */
interface ItemListJsonLdProps {
  items: { name: string; url: string; position?: number }[];
  name: string;
}

export function ItemListJsonLd({ items, name }: ItemListJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
