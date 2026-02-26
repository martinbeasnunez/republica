/**
 * JSON-LD Structured Data Components for SEO
 * Provides Organization, WebSite, Person, FAQPage, and BreadcrumbList schemas
 */

const BASE_URL = "https://condorperu.vercel.app";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CONDOR",
    alternateName: "CONDOR Perú 2026",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.ico`,
    description:
      "Plataforma de inteligencia electoral con IA para las elecciones presidenciales de Perú 2026. Análisis de candidatos, verificación de hechos y monitoreo de noticias en tiempo real.",
    foundingDate: "2025",
    areaServed: {
      "@type": "Country",
      name: "Peru",
    },
    knowsAbout: [
      "Elecciones Perú 2026",
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
      "La primera plataforma de inteligencia electoral con IA para las elecciones Perú 2026.",
    inLanguage: "es",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/candidatos?q={search_term_string}`,
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
}: CandidateJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: `Candidato presidencial - ${party}`,
    description: bio,
    url: `${BASE_URL}/candidatos/${slug}`,
    image: photo.startsWith("http") ? photo : `${BASE_URL}${photo}`,
    birthPlace: {
      "@type": "Place",
      name: region,
    },
    affiliation: {
      "@type": "PoliticalParty",
      name: party,
    },
    knowsAbout: [profession, "Política peruana", "Elecciones Perú 2026"],
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

export function ElectionJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Elecciones Generales Perú 2026",
    description:
      "Elecciones presidenciales y congresales de la República del Perú 2026. Primera vuelta electoral con más de 34 candidatos presidenciales.",
    startDate: "2026-04-12",
    endDate: "2026-04-12",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Country",
      name: "Peru",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PE",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "ONPE - Oficina Nacional de Procesos Electorales",
      url: "https://www.onpe.gob.pe",
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
