/**
 * JSON-LD Structured Data Components for SEO
 * Provides Organization, WebSite, Person, FAQPage, and BreadcrumbList schemas
 * Country-aware for multi-country support
 */

import { getCountryConfig, type CountryCode } from "@/lib/config/countries";

const BASE_URL = "https://condorperu.vercel.app";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CONDOR",
    alternateName: "CONDOR — Inteligencia Electoral con IA",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.ico`,
    description:
      "Plataforma de inteligencia electoral con IA para elecciones en Latinoamérica. Análisis de candidatos, verificación de hechos y monitoreo de noticias en tiempo real.",
    foundingDate: "2025",
    areaServed: [
      { "@type": "Country", name: "Peru" },
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
        urlTemplate: `${BASE_URL}/pe/candidatos?q={search_term_string}`,
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
    image: photo.startsWith("http") ? photo : `${BASE_URL}${photo}`,
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
