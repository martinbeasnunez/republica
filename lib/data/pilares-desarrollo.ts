// PILARES DE DESARROLLO — Framework de pilares clave para el crecimiento del Perú
// Basado en: WEF Global Competitiveness Index, World Bank Worldwide Governance Indicators,
// UNDP Human Development Index, OECD Better Life Index, World Justice Project Rule of Law Index,
// Transparency International CPI, PISA (OECD), IMD World Competitiveness Ranking

// =============================================================================
// TYPES
// =============================================================================

export interface InternationalFramework {
  id: string;
  name: string;
  organization: string;
  description: string;
  url: string;
  dimensions: string[];
  methodology: string;
  lastUpdated: string;
}

export interface PeruRanking {
  indexName: string;
  organization: string;
  year: number;
  rank: number | null;
  totalCountries: number;
  score: number | null;
  maxScore: number;
  trend: "mejorando" | "empeorando" | "estable" | "sin_datos_previos";
  sourceUrl: string;
  notes: string;
}

export interface BenchmarkCountry {
  country: string;
  region: string;
  relevance: string; // Why this country is a good benchmark for Peru
  keyReforms: string[];
  gdpPerCapita: number; // USD approximate
  yearsOfTransformation: string; // e.g. "1960-1990"
}

export interface DevelopmentPillar {
  id: string;
  number: number;
  name: string;
  nameEn: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color
  shortDescription: string;
  whyItMatters: string;
  dataPoints: string[]; // Key facts backed by data
  peruStatus: {
    summary: string;
    score: "critico" | "deficiente" | "en_progreso" | "aceptable" | "bueno";
    rankings: PeruRanking[];
    keyProblems: string[];
  };
  benchmark: {
    country: string;
    description: string;
    keyMetric: string;
  };
  frameworks: string[]; // IDs of international frameworks that include this pillar
  relatedPillars: string[]; // IDs of other pillars that are closely related
}

// =============================================================================
// INTERNATIONAL FRAMEWORKS
// =============================================================================

export const internationalFrameworks: InternationalFramework[] = [
  {
    id: "wef-gci",
    name: "Global Competitiveness Index 4.0",
    organization: "World Economic Forum (WEF)",
    description:
      "Índice que evalúa 103 indicadores organizados en 12 pilares que determinan la productividad y competitividad de 141 economías. Escala de 0 a 100, donde 100 representa la frontera ideal.",
    url: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
    dimensions: [
      "Instituciones",
      "Infraestructura",
      "Adopción de TIC",
      "Estabilidad macroeconómica",
      "Salud",
      "Habilidades/Educación",
      "Mercado de productos",
      "Mercado laboral",
      "Sistema financiero",
      "Tamaño del mercado",
      "Dinamismo empresarial",
      "Capacidad de innovación",
    ],
    methodology:
      "Combina datos de la Encuesta de Opinión Ejecutiva (2/3) con fuentes públicas como Naciones Unidas (1/3). Aproximadamente 15,000 ejecutivos encuestados a nivel global.",
    lastUpdated: "2019 (última edición publicada; suspendido desde 2020)",
  },
  {
    id: "wb-wgi",
    name: "Worldwide Governance Indicators (WGI)",
    organization: "Banco Mundial",
    description:
      "Indicadores compuestos de gobernanza que combinan 35 fuentes de datos incluyendo encuestas a hogares, empresas y evaluaciones de expertos en 214 economías desde 1996.",
    url: "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
    dimensions: [
      "Voz y rendición de cuentas",
      "Estabilidad política y ausencia de violencia",
      "Efectividad del gobierno",
      "Calidad regulatoria",
      "Estado de derecho",
      "Control de la corrupción",
    ],
    methodology:
      "Modelo de Componentes No Observados (UCM) que combina 35 fuentes de datos en una escala de 0 a 100. Incluye márgenes de error explícitos.",
    lastUpdated: "2024 (datos hasta 2023)",
  },
  {
    id: "undp-hdi",
    name: "Índice de Desarrollo Humano (IDH)",
    organization: "Programa de las Naciones Unidas para el Desarrollo (PNUD)",
    description:
      "Medida resumen del logro promedio en dimensiones clave del desarrollo humano: vida larga y saludable, conocimiento y nivel de vida digno.",
    url: "https://hdr.undp.org/data-center/human-development-index",
    dimensions: [
      "Salud (esperanza de vida al nacer)",
      "Educación (años promedio y esperados de escolaridad)",
      "Ingreso (INB per capita PPP)",
    ],
    methodology:
      "Media geométrica de índices normalizados para cada una de las tres dimensiones. Publicado en el Informe de Desarrollo Humano anual.",
    lastUpdated: "2025 (datos de 2023)",
  },
  {
    id: "oecd-bli",
    name: "Better Life Index",
    organization: "OECD",
    description:
      "Compara el bienestar de las personas en países de la OCDE basado en 11 dimensiones esenciales con 24 indicadores subyacentes.",
    url: "https://www.oecdbetterlifeindex.org/",
    dimensions: [
      "Vivienda",
      "Ingreso y riqueza",
      "Empleo y salarios",
      "Comunidad",
      "Educación",
      "Medio ambiente",
      "Compromiso cívico",
      "Salud",
      "Satisfacción con la vida",
      "Seguridad",
      "Balance trabajo-vida",
    ],
    methodology:
      "Indicadores normalizados agregados con pesos iguales dentro de cada dimensión. Los usuarios pueden personalizar pesos de 0 a 10 por dimensión.",
    lastUpdated: "2024",
  },
  {
    id: "wjp-roli",
    name: "Rule of Law Index",
    organization: "World Justice Project (WJP)",
    description:
      "Evalúa el cumplimiento del estado de derecho en 143 países utilizando 47 indicadores organizados en 8 factores, basado en encuestas a hogares y evaluaciones de expertos.",
    url: "https://worldjusticeproject.org/rule-of-law-index/",
    dimensions: [
      "Límites al poder gubernamental",
      "Ausencia de corrupción",
      "Gobierno abierto",
      "Derechos fundamentales",
      "Orden y seguridad",
      "Cumplimiento regulatorio",
      "Justicia civil",
      "Justicia penal",
    ],
    methodology:
      "Encuestas a más de 154,000 hogares y 3,600 expertos legales a nivel global. Escala de 0 a 1 donde 1 representa la máxima adherencia al estado de derecho.",
    lastUpdated: "2025",
  },
  {
    id: "ti-cpi",
    name: "Corruption Perceptions Index (CPI)",
    organization: "Transparency International",
    description:
      "Clasifica 180 países por sus niveles percibidos de corrupción en el sector público, según evaluaciones de expertos y encuestas empresariales.",
    url: "https://www.transparency.org/en/cpi/2024",
    dimensions: [
      "Corrupción en el sector público",
      "Soborno",
      "Desvío de fondos públicos",
      "Capacidad de los gobiernos para contener la corrupción",
      "Burocracia excesiva",
      "Nepotismo en nombramientos",
      "Capacidad de investigación y sanción",
    ],
    methodology:
      "Agregación de al menos 3 fuentes de datos de 13 posibles (encuestas a expertos y ejecutivos). Escala de 0 (altamente corrupto) a 100 (muy limpio).",
    lastUpdated: "2024",
  },
  {
    id: "oecd-pisa",
    name: "Programme for International Student Assessment (PISA)",
    organization: "OECD",
    description:
      "Evaluación internacional que mide la capacidad de estudiantes de 15 años para usar sus conocimientos en lectura, matemáticas y ciencias en situaciones de la vida real.",
    url: "https://www.oecd.org/en/about/programmes/pisa.html",
    dimensions: [
      "Matemáticas",
      "Lectura",
      "Ciencias",
    ],
    methodology:
      "Evaluación estandarizada aplicada cada 3 años a muestras representativas de estudiantes de 15 años. Puntaje promedio OCDE: ~475 puntos.",
    lastUpdated: "2022 (resultados publicados en diciembre 2023)",
  },
  {
    id: "imd-wcr",
    name: "World Competitiveness Ranking",
    organization: "IMD Business School",
    description:
      "Clasifica la competitividad de 67 economías basándose en su capacidad para crear y mantener un entorno favorable para la competitividad empresarial.",
    url: "https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/",
    dimensions: [
      "Desempeño económico",
      "Eficiencia del gobierno",
      "Eficiencia empresarial",
      "Infraestructura",
    ],
    methodology:
      "Combina 164 criterios de competitividad con datos estadísticos duros (2/3) y resultados de encuestas de percepción (1/3).",
    lastUpdated: "2025",
  },
];

// =============================================================================
// BENCHMARK COUNTRIES
// =============================================================================

export const benchmarkCountries: BenchmarkCountry[] = [
  {
    country: "Chile",
    region: "America Latina",
    relevance:
      "País vecino con contexto cultural similar. Líder regional en desarrollo humano (IDH #44), control de corrupción (CPI: 63/100), y competitividad. Demuestra que el progreso es posible en la región.",
    keyReforms: [
      "Autonomia del Banco Central (1989)",
      "Agencia de Calidad y Superintendencia de Educación",
      "Fortalecimiento de derechos de propiedad y seguridad jurídica",
      "Apertura comercial con tratados de libre comercio",
      "Sistema de evaluación docente basado en mérito",
    ],
    gdpPerCapita: 17200,
    yearsOfTransformation: "1985-2010",
  },
  {
    country: "Corea del Sur",
    region: "Asia Oriental",
    relevance:
      "Modelo de transformación de país pobre a economía avanzada en 30 años, impulsado por inversión masiva en educación y tecnología. PIB per capita pasó de ~100 USD (1960) a +34,000 USD.",
    keyReforms: [
      "Planes Quinquenales de Desarrollo Económico (1962-1996)",
      "Inversión del 4-5% del PIB en educación",
      "Estrategia de industrialización orientada a exportaciones",
      "Política de ciencia y tecnología con apoyo estatal a I+D",
      "Digitalización del sistema educativo y gobierno electrónico",
    ],
    gdpPerCapita: 34000,
    yearsOfTransformation: "1962-1996",
  },
  {
    country: "Estonia",
    region: "Europa del Este",
    relevance:
      "País pequeño que se transformó de estado post-soviético a líder mundial en gobierno digital. 100% de servicios gubernamentales digitalizados. PIB per capita pasó de 3,435 USD (1991) a 32,460 USD (2023).",
    keyReforms: [
      "Identidad digital (e-ID) para el 99% de la poblacion",
      "Plataforma X-Road para intercambio seguro de datos gubernamentales",
      "Principio de recolección única de datos del ciudadano",
      "Digitalización completa de servicios públicos",
      "Sector TIC contribuye ~7% del PIB",
    ],
    gdpPerCapita: 32460,
    yearsOfTransformation: "1991-2024",
  },
  {
    country: "Singapur",
    region: "Sudeste Asiatico",
    relevance:
      "Modelo ejemplar de combate a la corrupción como estrategia de desarrollo. Pasó de país corrupto a uno de los más limpios del mundo (#3 en CPI). Demuestra que la voluntad política puede transformar instituciones.",
    keyReforms: [
      "Creación del CPIB (agencia anticorrupción independiente, 1952)",
      "Prevention of Corruption Act con alcance público y privado",
      "Tolerancia cero con la corrupción desde el nivel más alto",
      "Salarios competitivos para funcionarios públicos",
      "Confiscación de ganancias ilícitas como elemento disuasorio",
    ],
    gdpPerCapita: 87900,
    yearsOfTransformation: "1965-2000",
  },
  {
    country: "Ruanda",
    region: "Africa Oriental",
    relevance:
      "Ejemplo de reconstrucción institucional post-conflicto con enfoque en gobernanza, rendición de cuentas e inclusión de género. Crecimiento del PIB promedio de 7.4% anual (2000-2023).",
    keyReforms: [
      "Visión 2050 con metas claras de transformación socioeconómica",
      "Reconstrucción de instituciones con énfasis en gobernanza y rendición de cuentas",
      "Ampliación de base tributaria doméstica",
      "Políticas de inclusión de género en todos los niveles de gobierno",
      "Descentralización para acercar servicios a los ciudadanos",
    ],
    gdpPerCapita: 1000,
    yearsOfTransformation: "1994-presente",
  },
];

// =============================================================================
// PERU RANKINGS OVERVIEW
// =============================================================================

export const peruRankings: PeruRanking[] = [
  {
    indexName: "Global Competitiveness Index 4.0",
    organization: "World Economic Forum",
    year: 2019,
    rank: 65,
    totalCountries: 141,
    score: 61.7,
    maxScore: 100,
    trend: "estable",
    sourceUrl: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
    notes: "Última edición publicada. El índice fue suspendido desde 2020. Perú se ubica en la mitad inferior a nivel global.",
  },
  {
    indexName: "Corruption Perceptions Index",
    organization: "Transparency International",
    year: 2024,
    rank: 127,
    totalCountries: 180,
    score: 31,
    maxScore: 100,
    trend: "empeorando",
    sourceUrl: "https://www.transparency.org/en/cpi/2024/index/per",
    notes: "Descenso de 2 puntos respecto al año anterior. Muy por debajo de Chile (63/100, puesto 31). Uno de los países peor evaluados en la región.",
  },
  {
    indexName: "Human Development Index",
    organization: "PNUD",
    year: 2022,
    rank: 88,
    totalCountries: 193,
    score: 0.762,
    maxScore: 1.0,
    trend: "estable",
    sourceUrl: "https://hdr.undp.org/data-center/human-development-index",
    notes: "Categoría 'desarrollo humano alto'. Chile lidera la región con 0.860 (puesto 44). Perú está por debajo del promedio de America Latina.",
  },
  {
    indexName: "Rule of Law Index",
    organization: "World Justice Project",
    year: 2025,
    rank: 93,
    totalCountries: 143,
    score: null,
    maxScore: 1.0,
    trend: "empeorando",
    sourceUrl: "https://worldjusticeproject.org/rule-of-law-index/country/Peru",
    notes: "Perú se ubica en el puesto 93 de 143 países. Puesto 29 de 41 entre países de ingreso medio-alto. Evalúa 8 factores incluyendo corrupción, justicia civil y penal.",
  },
  {
    indexName: "Ease of Doing Business",
    organization: "Banco Mundial",
    year: 2020,
    rank: 76,
    totalCountries: 190,
    score: null,
    maxScore: 100,
    trend: "estable",
    sourceUrl: "https://archive.doingbusiness.org/en/rankings",
    notes: "Última edición publicada (índice descontinuado en 2021). Perú se ubicaba en la mitad superior pero con debilidades en permisos de construcción y registro de propiedad.",
  },
  {
    indexName: "PISA 2022 (Matematicas)",
    organization: "OECD",
    year: 2022,
    rank: null,
    totalCountries: 81,
    score: 391,
    maxScore: 600,
    trend: "mejorando",
    sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/peru_3e71791c-en.html",
    notes: "Promedio OCDE: 472 puntos. Chile lidera la región con 412 puntos. Solo 34% de estudiantes peruanos alcanzan nivel 2 de competencia (vs 69% OCDE). Tendencia positiva de largo plazo.",
  },
  {
    indexName: "PISA 2022 (Lectura)",
    organization: "OECD",
    year: 2022,
    rank: null,
    totalCountries: 81,
    score: 408,
    maxScore: 600,
    trend: "estable",
    sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/peru_3e71791c-en.html",
    notes: "Promedio OCDE: 476 puntos. Solo 50% de estudiantes alcanzan nivel 2 (vs 74% OCDE). Solo 1% alcanza nivel 5 (vs 7% OCDE).",
  },
  {
    indexName: "IMD World Competitiveness Ranking",
    organization: "IMD Business School",
    year: 2024,
    rank: 63,
    totalCountries: 67,
    score: null,
    maxScore: 100,
    trend: "empeorando",
    sourceUrl: "https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/",
    notes: "Quinto en America Latina después de Chile (44), México (56), Colombia (57) y Brasil (62). Cerca del final del ranking global.",
  },
];

// =============================================================================
// KEY ECONOMIC INDICATORS FOR PERU
// =============================================================================

export interface EconomicIndicator {
  name: string;
  value: string;
  year: number;
  comparison: string;
  source: string;
  sourceUrl: string;
}

export const peruEconomicIndicators: EconomicIndicator[] = [
  {
    name: "PIB per capita",
    value: "USD 8,452",
    year: 2024,
    comparison: "Chile: USD 17,200 | OCDE: USD 46,000+",
    source: "Banco Mundial",
    sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=PE",
  },
  {
    name: "Crecimiento del PIB (promedio reciente)",
    value: "2.4% anual (2015-2024)",
    year: 2024,
    comparison: "Periodo 2005-2014: 6.2% anual. Desaceleración significativa.",
    source: "Banco Mundial",
    sourceUrl: "https://www.worldbank.org/en/country/peru/overview",
  },
  {
    name: "Informalidad laboral",
    value: "71.65% del empleo total",
    year: 2023,
    comparison: "Chile: ~27% | OCDE: ~15% | Economía informal: ~47% del PIB",
    source: "INEI / WIEGO",
    sourceUrl: "https://www.statista.com/statistics/1039975/informal-employment-share-peru/",
  },
  {
    name: "Recaudación tributaria (% del PIB)",
    value: "~17%",
    year: 2023,
    comparison: "Promedio LAC: 21.3% | OCDE: 33.8%. Caída de 2.1 pp entre 2022-2023.",
    source: "OECD Revenue Statistics LAC 2025",
    sourceUrl: "https://www.oecd.org/en/publications/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025_2922daa3.html",
  },
  {
    name: "Pobreza monetaria",
    value: "36.2% (< USD 8.30/dia PPP)",
    year: 2024,
    comparison: "Pre-pandemia (2019): 33.6%. Aún por encima de niveles prepandémicos.",
    source: "Banco Mundial",
    sourceUrl: "https://thedocs.worldbank.org/en/doc/e408a7e21ba62d843bdd90dc37e61b57-0500032021/related/mpo-per.pdf",
  },
  {
    name: "Coeficiente de Gini",
    value: "40.1",
    year: 2024,
    comparison: "Chile: 44.9 | OCDE promedio: ~32. Desigualdad moderada-alta.",
    source: "Banco Mundial",
    sourceUrl: "https://data.worldbank.org/indicator/SI.POV.GINI?locations=PE",
  },
  {
    name: "Dependencia minera (% de exportaciones)",
    value: "64% de exportaciones",
    year: 2024,
    comparison: "Minería: ~20% del PIB. Cobre y oro dominan exportaciones.",
    source: "Allianz Trade / EITI",
    sourceUrl: "https://eiti.org/countries/peru",
  },
  {
    name: "Penetración de internet",
    value: "74.7% de la poblacion",
    year: 2024,
    comparison: "Chile: ~90% | Brecha rural: solo 56.7% conectados vs 83-88% urbano.",
    source: "DataReportal Digital 2024",
    sourceUrl: "https://datareportal.com/reports/digital-2024-peru",
  },
  {
    name: "Cobertura de salud",
    value: "97% asegurados (SIS)",
    year: 2023,
    comparison: "Pero 7 de cada 10 personas que necesitan atención no la reciben (ENAHO 2022).",
    source: "OECD Reviews of Health Systems: Peru 2025",
    sourceUrl: "https://www.oecd.org/en/publications/2025/04/oecd-reviews-of-health-systems-peru-2025_3f7c00aa.html",
  },
];

// =============================================================================
// THE 10 DEVELOPMENT PILLARS
// =============================================================================

export const developmentPillars: DevelopmentPillar[] = [
  // -------------------------------------------------------------------------
  // PILLAR 1: INSTITUTIONAL STRENGTH & RULE OF LAW
  // -------------------------------------------------------------------------
  {
    id: "institucionalidad",
    number: 1,
    name: "Instituciones que Funcionen",
    nameEn: "Institutional Strength & Rule of Law",
    icon: "Landmark",
    color: "blue",
    shortDescription:
      "Que las leyes se cumplan, que los jueces sean independientes y que el Estado funcione para todos — no solo para los que tienen contactos.",
    whyItMatters:
      "Sin instituciones que funcionen, nada más funciona. Si no puedes confiar en que un juez sea justo, o en que un trámite no requiera coima, el país no avanza. Los países que salieron de la pobreza (Singapur, Corea, Chile) lo hicieron fortaleciendo sus instituciones primero. Perú ha tenido 6 presidentes en 5 años — eso no pasa en países serios.",
    dataPoints: [
      "Perú tuvo 6 presidentes en 5 años (2016-2021) — inestabilidad récord",
      "El mundo nos pone en el puesto 127 de 180 en percepción de corrupción",
      "Singapur era más corrupto que Perú y ahora es top 3 mundial — se puede cambiar",
      "Los países con instituciones fuertes crecen más y tienen menos pobreza, según el Banco Mundial",
    ],
    peruStatus: {
      summary:
        "Las instituciones peruanas están en crisis. La corrupción empeora cada año, nadie confía en los jueces, y la política es un caos. Mientras Chile y Uruguay mejoran, Perú va para atrás.",
      score: "critico",
      rankings: [
        {
          indexName: "Corruption Perceptions Index",
          organization: "Transparency International",
          year: 2024,
          rank: 127,
          totalCountries: 180,
          score: 31,
          maxScore: 100,
          trend: "empeorando",
          sourceUrl: "https://www.transparency.org/en/cpi/2024/index/per",
          notes: "Caída de 2 puntos respecto a 2023. Chile: 63/100 (puesto 31).",
        },
        {
          indexName: "Rule of Law Index",
          organization: "World Justice Project",
          year: 2025,
          rank: 93,
          totalCountries: 143,
          score: null,
          maxScore: 1.0,
          trend: "empeorando",
          sourceUrl: "https://worldjusticeproject.org/rule-of-law-index/country/Peru",
          notes: "Puesto 29 de 41 entre países de ingreso medio-alto.",
        },
      ],
      keyProblems: [
        "La corrupción empeora cada año — sacamos 31/100 (Chile saca 63)",
        "Nadie confía en los jueces ni en el Congreso",
        "6 presidentes en 5 años — inestabilidad política récord",
        "Las reglas del juego cambian según quién esté en el poder",
      ],
    },
    benchmark: {
      country: "Singapur",
      description:
        "Singapur creó el CPIB (agencia anticorrupción independiente bajo jurisdicción del Primer Ministro) y aplicó tolerancia cero. Combinado con la Prevention of Corruption Act, hizo de la corrupción una actividad de alto riesgo y baja recompensa.",
      keyMetric: "CPI: 83/100 (puesto 3 mundial)",
    },
    frameworks: ["wef-gci", "wb-wgi", "wjp-roli", "ti-cpi"],
    relatedPillars: ["anticorrupcion", "justicia-seguridad"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 2: ANTI-CORRUPTION
  // -------------------------------------------------------------------------
  {
    id: "anticorrupcion",
    number: 2,
    name: "Acabar con la Corrupción",
    nameEn: "Anti-Corruption",
    icon: "ShieldCheck",
    color: "red",
    shortDescription:
      "Que robar al Estado tenga consecuencias reales. Que los funcionarios corruptos vayan presos, no a otro cargo.",
    whyItMatters:
      "La corrupción es la razón #1 por la que Perú no avanza. Cada sol robado es un hospital que no se construye, una escuela sin techo. Perú saca 31 de 100 en el índice de corrupción — Chile saca 63, más del doble. Lo peor: cada año empeoramos. Pero Singapur demostró que se puede pasar de país corrupto a uno de los más limpios del mundo en pocas décadas.",
    dataPoints: [
      "Perú saca 31/100 en corrupción — Chile saca 63/100, más del doble",
      "Cada año Perú baja en el ranking: caímos 2 puntos más en 2024",
      "Caso Odebrecht: corrupción en todos los niveles de gobierno",
      "Singapur era corrupto como Perú y ahora es top 3 del mundo — con voluntad política se puede",
    ],
    peruStatus: {
      summary:
        "Perú es de los países más corruptos de América Latina y empeora cada año. Odebrecht demostró que la corrupción está en todos lados. La gente ya no confía en nadie.",
      score: "critico",
      rankings: [
        {
          indexName: "Corruption Perceptions Index",
          organization: "Transparency International",
          year: 2024,
          rank: 127,
          totalCountries: 180,
          score: 31,
          maxScore: 100,
          trend: "empeorando",
          sourceUrl: "https://www.transparency.org/en/cpi/2024/index/per",
          notes: "Tendencia negativa sostenida. Uruguay lidera la región con 72/100.",
        },
      ],
      keyProblems: [
        "31/100 en corrupción — estamos en el grupo de los peores del mundo",
        "Cada año sacamos peor nota — vamos para atrás",
        "Odebrecht demostró que la corrupción está en todos los niveles",
        "Los juicios por corrupción duran años y casi nadie va preso",
      ],
    },
    benchmark: {
      country: "Singapur",
      description:
        "Singapur implementó cuatro pilares: leyes fuertes, adjudicación efectiva, enforcement independiente (CPIB), y administración pública profesional. Confisca ganancias ilícitas y paga salarios competitivos a funcionarios.",
      keyMetric: "CPI: 83/100 — de país con corrupción endémica a top 3 mundial",
    },
    frameworks: ["ti-cpi", "wb-wgi", "wjp-roli", "wef-gci"],
    relatedPillars: ["institucionalidad", "justicia-seguridad"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 3: EDUCATION QUALITY
  // -------------------------------------------------------------------------
  {
    id: "educacion",
    number: 3,
    name: "Educación de Verdad",
    nameEn: "Education Quality",
    icon: "GraduationCap",
    color: "emerald",
    shortDescription:
      "Que un chico que sale del colegio sepa leer bien, hacer cuentas y conseguir trabajo. Hoy 2 de cada 3 no pueden.",
    whyItMatters:
      "Sin educación no hay futuro. Punto. En las pruebas PISA, los estudiantes peruanos sacan 391 en matemáticas — el promedio mundial es 472. Solo 1 de cada 3 chicos peruanos puede resolver un problema básico de matemáticas. Corea del Sur estaba peor que Perú hace 60 años y hoy es potencia tecnológica — invirtieron en educación durante 30 años seguidos.",
    dataPoints: [
      "Perú saca 391 en matemáticas PISA — el promedio mundial es 472 (estamos 81 puntos abajo)",
      "Solo 1 de cada 3 estudiantes puede resolver un problema básico de matemáticas",
      "Solo 1% de nuestros estudiantes llega al nivel avanzado en lectura (en la OCDE es 7%)",
      "Corea del Sur invirtió 5% del PIB en educación por 30 años y pasó de pobre a potencia",
    ],
    peruStatus: {
      summary:
        "Nuestros chicos salen del colegio sin las herramientas básicas. Estamos muy por debajo del mundo en todas las materias. Algo está mejorando, pero a paso de tortuga.",
      score: "deficiente",
      rankings: [
        {
          indexName: "PISA 2022 (Matematicas)",
          organization: "OECD",
          year: 2022,
          rank: null,
          totalCountries: 81,
          score: 391,
          maxScore: 600,
          trend: "mejorando",
          sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/peru_3e71791c-en.html",
          notes: "81 puntos por debajo del promedio OCDE. Chile: 412 puntos.",
        },
        {
          indexName: "PISA 2022 (Lectura)",
          organization: "OECD",
          year: 2022,
          rank: null,
          totalCountries: 81,
          score: 408,
          maxScore: 600,
          trend: "estable",
          sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/peru_3e71791c-en.html",
          notes: "68 puntos por debajo del promedio OCDE.",
        },
      ],
      keyProblems: [
        "Solo 1 de cada 3 chicos resuelve un problema básico de matemáticas",
        "Estamos 81 puntos abajo del promedio mundial en PISA",
        "Un chico de Lima aprende mucho más que uno del campo",
        "Invertimos poco en educación comparado con los países que sí crecieron",
      ],
    },
    benchmark: {
      country: "Corea del Sur",
      description:
        "Corea del Sur invirtió consistentemente 4-5% de su PIB en educación durante 30+ años, creó planes de educación alineados con sus planes de desarrollo económico, y usó tecnología educativa desde etapas tempranas. PISA 2022: Matemáticas 527, Lectura 515.",
      keyMetric: "PISA Matemáticas: 527 puntos (Perú: 391)",
    },
    frameworks: ["oecd-pisa", "wef-gci", "undp-hdi", "oecd-bli"],
    relatedPillars: ["transformacion-digital", "diversificacion-economica"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 4: INFRASTRUCTURE
  // -------------------------------------------------------------------------
  {
    id: "infraestructura",
    number: 4,
    name: "Carreteras, Agua e Internet",
    nameEn: "Infrastructure & Connectivity",
    icon: "Building2",
    color: "amber",
    shortDescription:
      "Que llegue agua limpia a todos, que las carreteras conecten el país, y que internet no sea un lujo.",
    whyItMatters:
      "Sin carreteras no hay comercio. Sin agua limpia no hay salud. Sin internet no hay futuro. En Perú, solo 2 de cada 10 hogares rurales tienen internet fijo. Hay pueblos donde el agua llega turbia o no llega. Mientras tanto, los proyectos de infraestructura se atrasan años por corrupción en las licitaciones.",
    dataPoints: [
      "Solo 2 de cada 10 hogares rurales tienen internet fijo (en la ciudad son 9 de 10)",
      "Proyectos de infraestructura con años de atraso y sobrecostos por corrupción",
      "Hay pueblos sin agua potable ni desagüe fuera de las ciudades principales",
      "Chile tiene la mejor logística de transporte de America Latina — Perú está lejos",
    ],
    peruStatus: {
      summary:
        "Fuera de Lima, Perú es otro país. Carreteras que no existen, pueblos sin agua, internet que no llega. Los proyectos se atrasan años y cuestan el doble por corrupción.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Global Competitiveness Index (Pilar Infraestructura)",
          organization: "World Economic Forum",
          year: 2019,
          rank: null,
          totalCountries: 141,
          score: null,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
          notes: "Infraestructura es una de las áreas más débiles de Perú en el GCI. Score general 61.7/100.",
        },
      ],
      keyProblems: [
        "Fuera de Lima parece otro país — sin carreteras, sin agua, sin internet",
        "Los proyectos se atrasan años por corrupción en las licitaciones",
        "Solo 2 de cada 10 hogares rurales tienen internet",
        "Hay pueblos donde el agua no llega o llega sucia",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile invirtió en infraestructura de transporte y concesiones público-privadas de manera consistente. Tiene la mejor infraestructura logística de America Latina según el LPI del Banco Mundial.",
      keyMetric: "LPI Chile entre los mejores de America Latina",
    },
    frameworks: ["wef-gci", "imd-wcr", "oecd-bli"],
    relatedPillars: ["transformacion-digital", "inclusion-social"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 5: DIGITAL TRANSFORMATION
  // -------------------------------------------------------------------------
  {
    id: "transformacion-digital",
    number: 5,
    name: "Digitalizar el Estado",
    nameEn: "Digital Transformation & E-Government",
    icon: "MonitorSmartphone",
    color: "violet",
    shortDescription:
      "Que puedas hacer trámites desde tu celular sin hacer cola. Que el Estado use tecnología en vez de papel.",
    whyItMatters:
      "En Estonia, el 100% de trámites del gobierno se hacen online — no hay colas, no hay coimas, no hay papeles. En Perú todavía hay que ir a una oficina, hacer cola y rezar. La digitalización reduce corrupción (todo queda registrado), ahorra plata al Estado y le facilita la vida a la gente. Perú está por debajo de Brasil, México, Chile, Colombia y Argentina en desarrollo digital.",
    dataPoints: [
      "En Estonia puedes hacer TODO online — en Perú todavía hay colas para todo",
      "75% de peruanos tiene internet, pero en zonas rurales solo 57%",
      "Perú está por debajo de Brasil, México, Chile, Colombia y Argentina en lo digital",
      "Estonia pasó de país pobre a tener el 7% de su economía en tecnología — se puede",
    ],
    peruStatus: {
      summary:
        "Algo hemos avanzado (SUNAT online funciona), pero estamos atrasados vs nuestros vecinos. La brecha entre Lima y el campo es enorme.",
      score: "en_progreso",
      rankings: [
        {
          indexName: "Network Readiness Index",
          organization: "Portulans Institute",
          year: 2024,
          rank: null,
          totalCountries: 134,
          score: null,
          maxScore: 100,
          trend: "mejorando",
          sourceUrl: "https://networkreadinessindex.org/network-readiness-in-latin-america-lessons-from-the-network-readiness-index-nri-2024/",
          notes: "Perú clasificado con nivel medio de desarrollo digital en America Latina. Debilidades en competencias TIC y marcos regulatorios.",
        },
      ],
      keyProblems: [
        "En el campo, solo la mitad tiene internet — en la ciudad casi todos",
        "Solo 2 de cada 10 hogares rurales con internet fijo",
        "Estamos por debajo de Brasil, México, Chile, Colombia y Argentina en lo digital",
        "La mayoría de trámites del Estado todavía requieren ir físicamente a una oficina",
      ],
    },
    benchmark: {
      country: "Estonia",
      description:
        "Estonia digitalizó el 100% de sus servicios gubernamentales, creó identidad digital para el 99% de la población, e implementó X-Road para intercambio seguro de datos. Su PIB per capita pasó de USD 3,435 a USD 32,460 entre 1991 y 2023.",
      keyMetric: "100% servicios gubernamentales digitales / TIC = 7% del PIB",
    },
    frameworks: ["wef-gci", "imd-wcr"],
    relatedPillars: ["infraestructura", "educacion", "institucionalidad"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 6: ECONOMIC DIVERSIFICATION
  // -------------------------------------------------------------------------
  {
    id: "diversificacion-economica",
    number: 6,
    name: "No Solo Minería",
    nameEn: "Economic Diversification & Productivity",
    icon: "TrendingUp",
    color: "orange",
    shortDescription:
      "Perú vive de la minería. Si baja el precio del cobre, nos hundimos. Necesitamos crear otras industrias y formalizar empleos.",
    whyItMatters:
      "El 64% de lo que Perú exporta son metales. Si mañana baja el precio del cobre, se nos cae la economía. Además, 7 de cada 10 peruanos trabajan en la informalidad — sin seguro, sin jubilación, sin derechos. Chile diversificó hacia servicios, agroindustria y tecnología. Perú se quedó en la minería y en el crecimiento pasó de 6% a 2% anual.",
    dataPoints: [
      "64% de lo que exportamos son metales — demasiado huevo en una sola canasta",
      "7 de cada 10 peruanos trabajan sin contrato, sin seguro, sin derechos",
      "La economía informal es casi la mitad del PIB — plata que no paga impuestos",
      "Antes crecíamos 6% al año, ahora solo 2.4% — nos estamos frenando",
      "Chile diversificó su economía y su PIB per capita es el doble que el nuestro",
    ],
    peruStatus: {
      summary:
        "Vivimos de la minería y de la informalidad. Si el cobre baja, nos hundimos. 7 de cada 10 trabajan sin derechos. El crecimiento se frenó a la mitad.",
      score: "deficiente",
      rankings: [
        {
          indexName: "IMD World Competitiveness Ranking",
          organization: "IMD Business School",
          year: 2024,
          rank: 63,
          totalCountries: 67,
          score: null,
          maxScore: 100,
          trend: "empeorando",
          sourceUrl: "https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/",
          notes: "Quinto en LAC después de Chile (44), México (56), Colombia (57) y Brasil (62). Cerca del final del ranking global.",
        },
        {
          indexName: "Global Competitiveness Index 4.0",
          organization: "World Economic Forum",
          year: 2019,
          rank: 65,
          totalCountries: 141,
          score: 61.7,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
          notes: "Pilar de Innovación y Dinamismo Empresarial entre los más débiles.",
        },
      ],
      keyProblems: [
        "64% de lo que exportamos son metales — si baja el cobre, nos hundimos",
        "7 de cada 10 trabajan informal — sin contrato, sin seguro, sin futuro",
        "Casi la mitad del PIB es informal — plata invisible para el Estado",
        "El crecimiento se frenó a la mitad: de 6% a 2.4% anual",
        "Chile gana el doble que nosotros per capita — y éramos similares",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile diversificó más allá de la minería hacia servicios financieros, agroindustria, energía renovable y tecnología. Mantuvo apertura comercial con múltiples TLCs y reformas pro-empresa.",
      keyMetric: "PIB per capita Chile: USD 17,200 vs Peru: USD 8,452",
    },
    frameworks: ["wef-gci", "imd-wcr", "oecd-bli"],
    relatedPillars: ["educacion", "infraestructura", "capacidad-fiscal"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 7: HEALTHCARE
  // -------------------------------------------------------------------------
  {
    id: "salud",
    number: 7,
    name: "Salud que Funcione",
    nameEn: "Healthcare & Social Protection",
    icon: "HeartPulse",
    color: "rose",
    shortDescription:
      "El 97% tiene seguro de salud en papel, pero 7 de cada 10 no reciben atención cuando la necesitan. Eso no es salud.",
    whyItMatters:
      "Tener un carnet del SIS no sirve si cuando te enfermas no hay cama, no hay doctor o te hacen esperar semanas. En Perú, 7 de cada 10 personas que necesitan atención médica NO la reciben. En Puno es el doble de grave que en Lima. Un país donde la gente se muere por falta de atención no puede crecer.",
    dataPoints: [
      "7 de cada 10 peruanos que necesitan atención médica NO la reciben",
      "35% no va al doctor porque los tiempos de espera son eternos",
      "En Puno la falta de atención es el doble que en Lima (40% vs 23%)",
      "Vivimos 72 años en promedio — un chileno vive 79, casi 7 años más",
    ],
    peruStatus: {
      summary:
        "Todos tenemos carnet del SIS, pero cuando te enfermas no hay cama ni doctor. El sistema esta roto. En provincias es mucho peor que en Lima.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Human Development Index (componente salud)",
          organization: "PNUD",
          year: 2022,
          rank: 88,
          totalCountries: 193,
          score: 0.762,
          maxScore: 1.0,
          trend: "estable",
          sourceUrl: "https://hdr.undp.org/data-center/human-development-index",
          notes: "Esperanza de vida: 72.4 años. Chile: 78.9 años.",
        },
      ],
      keyProblems: [
        "7 de cada 10 que necesitan doctor NO lo consiguen",
        "El sistema está partido en pedazos — SIS, EsSalud, clínicas, y ninguno se habla",
        "En Puno la gente se queda sin atención el doble que en Lima",
        "Las mujeres sufren más — 33% sin atención vs 29% de hombres",
        "Perú gasta menos en salud que cualquier otro país de la región",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene un sistema de salud mixto (FONASA/ISAPRE) con mejor integración y cobertura efectiva. Esperanza de vida de 78.9 años. Inversión en salud como porcentaje del PIB significativamente mayor.",
      keyMetric: "Esperanza de vida Chile: 78.9 años vs Perú: 72.4 años",
    },
    frameworks: ["wef-gci", "undp-hdi", "oecd-bli"],
    relatedPillars: ["inclusion-social", "infraestructura"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 8: SOCIAL INCLUSION
  // -------------------------------------------------------------------------
  {
    id: "inclusion-social",
    number: 8,
    name: "Que Nadie se Quede Atrás",
    nameEn: "Social Inclusion & Inequality Reduction",
    icon: "Users",
    color: "teal",
    shortDescription:
      "4 de cada 10 peruanos son pobres. La mitad no come bien. Un chico en Lima tiene 3 veces más oportunidades que uno en Huancavelica.",
    whyItMatters:
      "36% de peruanos vive en pobreza y más de la mitad no come lo suficiente. Si naciste en Lima, tus oportunidades son 3 veces mayores que si naciste en los Andes o la Amazonía. La pandemia borró años de progreso — la pobreza saltó de 20% a 30% de un año a otro. Un país donde la mitad sufre no puede avanzar.",
    dataPoints: [
      "36% de peruanos son pobres — con menos de 30 soles al día",
      "Más de la mitad de peruanos no come bien (inseguridad alimentaria)",
      "La pandemia borró años de progreso: pobreza saltó de 20% a 30% en un año",
      "Un chico de Lima tiene 3 veces más oportunidades que uno del campo",
    ],
    peruStatus: {
      summary:
        "Habíamos avanzado, pero la pandemia nos devolvió años atrás. La pobreza todavía está peor que antes del COVID. Y si vives fuera de Lima, todo es peor.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Human Development Index",
          organization: "PNUD",
          year: 2022,
          rank: 88,
          totalCountries: 193,
          score: 0.762,
          maxScore: 1.0,
          trend: "estable",
          sourceUrl: "https://hdr.undp.org/data-center/human-development-index",
          notes: "Desarrollo humano 'alto' pero por debajo del promedio LAC. Chile: 0.860 (puesto 44).",
        },
      ],
      keyProblems: [
        "36% vive en pobreza — peor que antes de la pandemia",
        "Más de la mitad de peruanos no come lo suficiente",
        "La desigualdad es de las más altas de América Latina",
        "Si naces fuera de Lima, tus chances de salir adelante son mucho menores",
      ],
    },
    benchmark: {
      country: "Ruanda",
      description:
        "Ruanda integró políticas de inclusión de género en todos los niveles de gobierno y priorizó la equidad territorial a través de la descentralización. Crecimiento del PIB promedio de 7.4% anual (2000-2023).",
      keyMetric: "Primer país del mundo en representación femenina parlamentaria (61%)",
    },
    frameworks: ["undp-hdi", "oecd-bli", "wb-wgi"],
    relatedPillars: ["salud", "educacion", "infraestructura"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 9: FISCAL CAPACITY
  // -------------------------------------------------------------------------
  {
    id: "capacidad-fiscal",
    number: 9,
    name: "El Estado No Tiene Plata",
    nameEn: "Fiscal Capacity & Public Management",
    icon: "Wallet",
    color: "cyan",
    shortDescription:
      "Perú recauda la mitad de lo que necesita. Sin plata no hay hospitales, ni colegios, ni carreteras. Y la informalidad hace que casi nadie pague impuestos.",
    whyItMatters:
      "El Estado peruano recauda 17% del PIB en impuestos — los países desarrollados recaudan 34%, el doble. Sin plata no puedes construir hospitales, pagar buenos profesores ni hacer carreteras. La razón principal: 7 de cada 10 trabajan en la informalidad y no pagan impuestos. Es un círculo vicioso: el Estado no recauda, entonces no da buenos servicios, entonces la gente no quiere pagar.",
    dataPoints: [
      "Perú recauda 17% del PIB — los países desarrollados recaudan 34%, el doble",
      "Somos de los que menos recaudamos en toda América Latina",
      "En 2023 recaudamos aún MENOS que en 2022 — vamos para atrás",
      "7 de cada 10 trabajan informal y no pagan impuestos — el Estado se queda sin plata",
    ],
    peruStatus: {
      summary:
        "El Estado no tiene plata porque casi nadie paga impuestos. Recaudamos la mitad de lo que necesitamos. Y cada año recaudamos menos, no más.",
      score: "critico",
      rankings: [
        {
          indexName: "Tax-to-GDP Ratio",
          organization: "OECD Revenue Statistics LAC",
          year: 2023,
          rank: null,
          totalCountries: 26,
          score: 17,
          maxScore: 100,
          trend: "empeorando",
          sourceUrl: "https://www.oecd.org/en/publications/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025_2922daa3.html",
          notes: "Mayor caída de la región: -2.1 pp entre 2022 y 2023. OCDE promedio: 33.8%.",
        },
      ],
      keyProblems: [
        "Recaudamos la mitad de lo que necesitamos — 17% vs 34% de países desarrollados",
        "En 2023 recaudamos MENOS que en 2022 — la peor caída de la región",
        "7 de cada 10 trabajan informal — no pagan impuestos",
        "Dependemos de la mineria para los ingresos — y los precios suben y bajan",
        "No hay plata para hospitales, colegios ni carreteras porque no recaudamos",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene una recaudación tributaria alrededor del 21% del PIB, con reformas tributarias progresivas, una administración fiscal más eficiente y menor informalidad (~27% del empleo).",
      keyMetric: "Chile: ~21% del PIB en impuestos vs Peru: ~17%",
    },
    frameworks: ["wef-gci", "wb-wgi", "imd-wcr"],
    relatedPillars: ["diversificacion-economica", "institucionalidad", "anticorrupcion"],
  },

  // -------------------------------------------------------------------------
  // PILLAR 10: CITIZEN SECURITY & JUSTICE
  // -------------------------------------------------------------------------
  {
    id: "justicia-seguridad",
    number: 10,
    name: "Seguridad y Justicia de Verdad",
    nameEn: "Citizen Security & Access to Justice",
    icon: "Scale",
    color: "indigo",
    shortDescription:
      "Que puedas caminar tranquilo por la calle. Que si te roban, la policia haga algo. Que los jueces no se vendan.",
    whyItMatters:
      "La inseguridad es la preocupación #1 de los peruanos. Pero no basta con más policías — necesitas jueces que no se vendan, cárceles que rehabiliten y un sistema que funcione. Perú está en el puesto 93 de 143 en estado de derecho. Si denuncias un robo, no pasa nada. Si un político roba, tampoco. Así no se construye un país.",
    dataPoints: [
      "Perú está en el puesto 93 de 143 países en estado de derecho — en el tercio más bajo",
      "La inseguridad es la preocupación #1 de los peruanos según todas las encuestas",
      "Si denuncias un robo, la probabilidad de que se resuelva es mínima",
      "En Lima la justicia funciona (más o menos) — en provincias es casi inexistente",
    ],
    peruStatus: {
      summary:
        "La gente tiene miedo de salir a la calle. La policía no da abasto. Los jueces no inspiran confianza. Y si vives en provincia, la justicia casi no existe.",
      score: "critico",
      rankings: [
        {
          indexName: "Rule of Law Index",
          organization: "World Justice Project",
          year: 2025,
          rank: 93,
          totalCountries: 143,
          score: null,
          maxScore: 1.0,
          trend: "empeorando",
          sourceUrl: "https://worldjusticeproject.org/rule-of-law-index/country/Peru",
          notes: "Puesto 29 de 41 entre países de ingreso medio-alto. Evalúa justicia civil, penal, corrupción y derechos fundamentales.",
        },
      ],
      keyProblems: [
        "La inseguridad es lo que más preocupa a los peruanos",
        "Si te roban y denuncias, casi nunca pasa nada",
        "Los jueces no inspiran confianza — presión política y mediática",
        "En provincias casi no hay acceso a justicia",
        "Estamos en el puesto 93 de 143 paises en estado de derecho",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene un sistema judicial más independiente y eficiente, con reformas procesales penales exitosas. Se ubica en el puesto 27 del WJP Rule of Law Index, entre los mejores de América Latina junto con Uruguay y Costa Rica.",
      keyMetric: "Chile: puesto 27/143 en Rule of Law Index vs Peru: 93/143",
    },
    frameworks: ["wjp-roli", "wb-wgi", "wef-gci"],
    relatedPillars: ["institucionalidad", "anticorrupcion"],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getPillarById(id: string): DevelopmentPillar | undefined {
  return developmentPillars.find((p) => p.id === id);
}

export function getPillarByNumber(number: number): DevelopmentPillar | undefined {
  return developmentPillars.find((p) => p.number === number);
}

export function getFrameworkById(id: string): InternationalFramework | undefined {
  return internationalFrameworks.find((f) => f.id === id);
}

export function getPillarsByFramework(frameworkId: string): DevelopmentPillar[] {
  return developmentPillars.filter((p) => p.frameworks.includes(frameworkId));
}

export function getRelatedPillars(pillarId: string): DevelopmentPillar[] {
  const pillar = getPillarById(pillarId);
  if (!pillar) return [];
  return pillar.relatedPillars
    .map((id) => getPillarById(id))
    .filter((p): p is DevelopmentPillar => p !== undefined);
}

export function getBenchmarkCountryByName(name: string): BenchmarkCountry | undefined {
  return benchmarkCountries.find((c) => c.country === name);
}

export function getPillarScoreColor(score: DevelopmentPillar["peruStatus"]["score"]): string {
  const colors = {
    critico: "rose",
    deficiente: "amber",
    en_progreso: "sky",
    aceptable: "emerald",
    bueno: "green",
  };
  return colors[score];
}

export function getPillarScoreLabel(score: DevelopmentPillar["peruStatus"]["score"]): string {
  const labels = {
    critico: "Crítico",
    deficiente: "Deficiente",
    en_progreso: "En Progreso",
    aceptable: "Aceptable",
    bueno: "Bueno",
  };
  return labels[score];
}

// Summary stats for dashboard
export function getPillarsSummary() {
  const total = developmentPillars.length;
  const byScore = {
    critico: developmentPillars.filter((p) => p.peruStatus.score === "critico").length,
    deficiente: developmentPillars.filter((p) => p.peruStatus.score === "deficiente").length,
    en_progreso: developmentPillars.filter((p) => p.peruStatus.score === "en_progreso").length,
    aceptable: developmentPillars.filter((p) => p.peruStatus.score === "aceptable").length,
    bueno: developmentPillars.filter((p) => p.peruStatus.score === "bueno").length,
  };
  return { total, byScore };
}
