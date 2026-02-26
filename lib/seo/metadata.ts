// =============================================================================
// SEO Metadata Helpers — Consistent multi-country SEO across all pages
// =============================================================================

import { getCountryConfig, type CountryCode } from "@/lib/config/countries";

const BASE_URL = "https://condorlatam.com";

/**
 * Generates country-aware SEO primitives for any page:
 * - hreflang alternates (es-PE / es-CO)
 * - OpenGraph locale
 * - Canonical URL
 * - Country name / year / domain
 */
export function getCountrySeo(country: string, path: string = "") {
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const domain = config?.domain ?? "condorlatam.com";
  const locale = config?.locale ?? "es_PE";

  const fullPath = path ? `/${country}${path}` : `/${country}`;
  const otherCountry: CountryCode = country === "co" ? "pe" : "co";
  const otherPath = path ? `/${otherCountry}${path}` : `/${otherCountry}`;

  return {
    name,
    year,
    domain,
    locale,
    country: country as CountryCode,
    alternates: {
      canonical: `${BASE_URL}${fullPath}`,
      languages: {
        "es-PE": `${BASE_URL}/pe${path}`,
        "es-CO": `${BASE_URL}/co${path}`,
        "x-default": `${BASE_URL}/pe${path}`,
      },
    },
    openGraph: {
      locale: locale.replace("_", "-"), // es-PE or es-CO
      url: `${BASE_URL}${fullPath}`,
    },
  };
}

/**
 * Country-specific keywords per page section.
 * Returns keywords array with country name & year injected.
 */
export function getCountryKeywords(
  country: string,
  section:
    | "home"
    | "candidatos"
    | "candidato"
    | "encuestas"
    | "noticias"
    | "verificador"
    | "planes"
    | "mapa"
    | "quiz"
    | "en-vivo"
    | "pilares"
    | "radiografia"
    | "comparar"
): string[] {
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const nameLower = name.toLowerCase();
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const isCo = country === "co";

  const base = [
    `elecciones ${nameLower} ${year}`,
    `candidatos presidenciales ${nameLower} ${year}`,
  ];

  const sectionKeywords: Record<string, string[]> = {
    home: [
      ...base,
      `encuestas ${nameLower} ${year}`,
      `elecciones presidenciales ${nameLower}`,
      `quien va ganando ${nameLower} ${year}`,
      `por quien votar ${nameLower} ${year}`,
      `resultados encuestas ${nameLower}`,
      ...(isCo
        ? [
            "elecciones colombia mayo 2026",
            "primera vuelta colombia 2026",
            "candidatos colombia presidencia",
          ]
        : [
            "elecciones peru abril 2026",
            "primera vuelta peru 2026",
            "candidatos peru presidencia",
          ]),
    ],
    candidatos: [
      ...base,
      `todos los candidatos ${nameLower} ${year}`,
      `lista candidatos presidenciales ${nameLower}`,
      `propuestas candidatos ${nameLower} ${year}`,
      ...(isCo
        ? ["candidatos presidencia colombia", "aspirantes presidencia colombia 2026"]
        : ["candidatos presidencia peru", "candidatos peru primera vuelta"]),
    ],
    candidato: [
      `candidato presidencial ${nameLower} ${year}`,
      `encuestas ${nameLower} ${year}`,
      `plan de gobierno ${nameLower} ${year}`,
      `propuestas electorales ${nameLower}`,
    ],
    encuestas: [
      `encuestas ${nameLower} ${year}`,
      `ultima encuesta ${nameLower} ${year}`,
      `intencion de voto ${nameLower} ${year}`,
      `encuesta presidencial ${nameLower} ${year}`,
      `quien va ganando en ${nameLower}`,
      `promedio encuestas ${nameLower}`,
      ...(isCo
        ? ["encuestas invamer 2026", "encuestas datexco 2026", "encuesta cifras y conceptos"]
        : ["encuestas ipsos peru", "encuestas datum peru", "encuesta iep peru"]),
    ],
    noticias: [
      `noticias elecciones ${nameLower} ${year}`,
      `noticias electorales ${nameLower}`,
      `ultima hora elecciones ${nameLower}`,
      `noticias candidatos ${nameLower} ${year}`,
      ...(isCo
        ? ["noticias politica colombia", "elecciones colombia noticias"]
        : ["noticias politica peru", "elecciones peru noticias"]),
    ],
    verificador: [
      `verificador de hechos ${nameLower}`,
      `fact check elecciones ${nameLower} ${year}`,
      `noticias falsas elecciones ${nameLower}`,
      `verificar informacion ${nameLower}`,
      ...(isCo
        ? ["colombiacheck", "fake news colombia elecciones"]
        : ["fake news peru elecciones", "ojo publico peru"]),
    ],
    planes: [
      `planes de gobierno ${nameLower} ${year}`,
      `propuestas candidatos ${nameLower} ${year}`,
      `comparar planes de gobierno ${nameLower}`,
      `plan de gobierno elecciones ${nameLower}`,
      ...(isCo
        ? ["propuestas candidatos colombia 2026", "planes gobierno colombia"]
        : ["propuestas candidatos peru 2026", "planes gobierno peru"]),
    ],
    mapa: [
      `mapa electoral ${nameLower} ${year}`,
      `resultados por region ${nameLower}`,
      `mapa elecciones ${nameLower}`,
      ...(isCo
        ? ["mapa electoral colombia departamentos", "voto por departamento colombia"]
        : ["mapa electoral peru regiones", "voto por region peru"]),
    ],
    quiz: [
      `por quien votar ${year} ${nameLower}`,
      `quiz electoral ${year}`,
      `con que candidato coincido`,
      `elecciones ${year} ${nameLower} quiz`,
      `candidatos presidenciales ${year} ${nameLower}`,
      `test electoral ${nameLower}`,
      ...(isCo
        ? ["test por quien votar colombia", "quiz elecciones colombia 2026"]
        : ["test por quien votar peru", "quiz elecciones peru 2026"]),
    ],
    "en-vivo": [
      `elecciones ${nameLower} en vivo`,
      `resultados en vivo ${nameLower} ${year}`,
      `cobertura elecciones ${nameLower}`,
      `seguimiento electoral ${nameLower} ${year}`,
    ],
    pilares: [
      `desarrollo ${nameLower}`,
      `indicadores ${nameLower} ${year}`,
      `pilares desarrollo ${nameLower}`,
      `economia ${nameLower} ${year}`,
      `educacion ${nameLower}`,
      `corrupcion ${nameLower}`,
      ...(isCo
        ? ["indices colombia", "desarrollo humano colombia", "pisa colombia"]
        : ["indices peru", "desarrollo humano peru", "pisa peru"]),
    ],
    radiografia: [
      `radiografia candidatos ${nameLower} ${year}`,
      `patrimonio candidatos ${nameLower}`,
      `candidatos procesos legales ${nameLower}`,
      `financiamiento campañas ${nameLower} ${year}`,
    ],
    comparar: [
      `comparar candidatos ${nameLower} ${year}`,
      `candidatos lado a lado ${nameLower}`,
      `diferencias candidatos ${nameLower} ${year}`,
      `comparador propuestas ${nameLower}`,
    ],
  };

  return sectionKeywords[section] ?? base;
}
