// PILARES DE DESARROLLO — Framework de pilares clave para el crecimiento del Peru
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
      "Indice que evalua 103 indicadores organizados en 12 pilares que determinan la productividad y competitividad de 141 economias. Escala de 0 a 100, donde 100 representa la frontera ideal.",
    url: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
    dimensions: [
      "Instituciones",
      "Infraestructura",
      "Adopcion de TIC",
      "Estabilidad macroeconomica",
      "Salud",
      "Habilidades/Educacion",
      "Mercado de productos",
      "Mercado laboral",
      "Sistema financiero",
      "Tamano del mercado",
      "Dinamismo empresarial",
      "Capacidad de innovacion",
    ],
    methodology:
      "Combina datos de la Encuesta de Opinion Ejecutiva (2/3) con fuentes publicas como Naciones Unidas (1/3). Aproximadamente 15,000 ejecutivos encuestados a nivel global.",
    lastUpdated: "2019 (ultima edicion publicada; suspendido desde 2020)",
  },
  {
    id: "wb-wgi",
    name: "Worldwide Governance Indicators (WGI)",
    organization: "Banco Mundial",
    description:
      "Indicadores compuestos de gobernanza que combinan 35 fuentes de datos incluyendo encuestas a hogares, empresas y evaluaciones de expertos en 214 economias desde 1996.",
    url: "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
    dimensions: [
      "Voz y rendicion de cuentas",
      "Estabilidad politica y ausencia de violencia",
      "Efectividad del gobierno",
      "Calidad regulatoria",
      "Estado de derecho",
      "Control de la corrupcion",
    ],
    methodology:
      "Modelo de Componentes No Observados (UCM) que combina 35 fuentes de datos en una escala de 0 a 100. Incluye margenes de error explicitos.",
    lastUpdated: "2024 (datos hasta 2023)",
  },
  {
    id: "undp-hdi",
    name: "Indice de Desarrollo Humano (IDH)",
    organization: "Programa de las Naciones Unidas para el Desarrollo (PNUD)",
    description:
      "Medida resumen del logro promedio en dimensiones clave del desarrollo humano: vida larga y saludable, conocimiento y nivel de vida digno.",
    url: "https://hdr.undp.org/data-center/human-development-index",
    dimensions: [
      "Salud (esperanza de vida al nacer)",
      "Educacion (anos promedio y esperados de escolaridad)",
      "Ingreso (INB per capita PPP)",
    ],
    methodology:
      "Media geometrica de indices normalizados para cada una de las tres dimensiones. Publicado en el Informe de Desarrollo Humano anual.",
    lastUpdated: "2025 (datos de 2023)",
  },
  {
    id: "oecd-bli",
    name: "Better Life Index",
    organization: "OECD",
    description:
      "Compara el bienestar de las personas en paises de la OCDE basado en 11 dimensiones esenciales con 24 indicadores subyacentes.",
    url: "https://www.oecdbetterlifeindex.org/",
    dimensions: [
      "Vivienda",
      "Ingreso y riqueza",
      "Empleo y salarios",
      "Comunidad",
      "Educacion",
      "Medio ambiente",
      "Compromiso civico",
      "Salud",
      "Satisfaccion con la vida",
      "Seguridad",
      "Balance trabajo-vida",
    ],
    methodology:
      "Indicadores normalizados agregados con pesos iguales dentro de cada dimension. Los usuarios pueden personalizar pesos de 0 a 10 por dimension.",
    lastUpdated: "2024",
  },
  {
    id: "wjp-roli",
    name: "Rule of Law Index",
    organization: "World Justice Project (WJP)",
    description:
      "Evalua el cumplimiento del estado de derecho en 143 paises utilizando 47 indicadores organizados en 8 factores, basado en encuestas a hogares y evaluaciones de expertos.",
    url: "https://worldjusticeproject.org/rule-of-law-index/",
    dimensions: [
      "Limites al poder gubernamental",
      "Ausencia de corrupcion",
      "Gobierno abierto",
      "Derechos fundamentales",
      "Orden y seguridad",
      "Cumplimiento regulatorio",
      "Justicia civil",
      "Justicia penal",
    ],
    methodology:
      "Encuestas a mas de 154,000 hogares y 3,600 expertos legales a nivel global. Escala de 0 a 1 donde 1 representa la maxima adherencia al estado de derecho.",
    lastUpdated: "2025",
  },
  {
    id: "ti-cpi",
    name: "Corruption Perceptions Index (CPI)",
    organization: "Transparency International",
    description:
      "Clasifica 180 paises por sus niveles percibidos de corrupcion en el sector publico, segun evaluaciones de expertos y encuestas empresariales.",
    url: "https://www.transparency.org/en/cpi/2024",
    dimensions: [
      "Corrupcion en el sector publico",
      "Soborno",
      "Desvio de fondos publicos",
      "Capacidad de los gobiernos para contener la corrupcion",
      "Burocracia excesiva",
      "Nepotismo en nombramientos",
      "Capacidad de investigacion y sancion",
    ],
    methodology:
      "Agregacion de al menos 3 fuentes de datos de 13 posibles (encuestas a expertos y ejecutivos). Escala de 0 (altamente corrupto) a 100 (muy limpio).",
    lastUpdated: "2024",
  },
  {
    id: "oecd-pisa",
    name: "Programme for International Student Assessment (PISA)",
    organization: "OECD",
    description:
      "Evaluacion internacional que mide la capacidad de estudiantes de 15 anos para usar sus conocimientos en lectura, matematicas y ciencias en situaciones de la vida real.",
    url: "https://www.oecd.org/en/about/programmes/pisa.html",
    dimensions: [
      "Matematicas",
      "Lectura",
      "Ciencias",
    ],
    methodology:
      "Evaluacion estandarizada aplicada cada 3 anos a muestras representativas de estudiantes de 15 anos. Puntaje promedio OCDE: ~475 puntos.",
    lastUpdated: "2022 (resultados publicados en diciembre 2023)",
  },
  {
    id: "imd-wcr",
    name: "World Competitiveness Ranking",
    organization: "IMD Business School",
    description:
      "Clasifica la competitividad de 67 economias basandose en su capacidad para crear y mantener un entorno favorable para la competitividad empresarial.",
    url: "https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/",
    dimensions: [
      "Desempeno economico",
      "Eficiencia del gobierno",
      "Eficiencia empresarial",
      "Infraestructura",
    ],
    methodology:
      "Combina 164 criterios de competitividad con datos estadisticos duros (2/3) y resultados de encuestas de percepcion (1/3).",
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
      "Pais vecino con contexto cultural similar. Lider regional en desarrollo humano (IDH #44), control de corrupcion (CPI: 63/100), y competitividad. Demuestra que el progreso es posible en la region.",
    keyReforms: [
      "Autonomia del Banco Central (1989)",
      "Agencia de Calidad y Superintendencia de Educacion",
      "Fortalecimiento de derechos de propiedad y seguridad juridica",
      "Apertura comercial con tratados de libre comercio",
      "Sistema de evaluacion docente basado en merito",
    ],
    gdpPerCapita: 17200,
    yearsOfTransformation: "1985-2010",
  },
  {
    country: "Corea del Sur",
    region: "Asia Oriental",
    relevance:
      "Modelo de transformacion de pais pobre a economia avanzada en 30 anos, impulsado por inversion masiva en educacion y tecnologia. PIB per capita paso de ~100 USD (1960) a +34,000 USD.",
    keyReforms: [
      "Planes Quinquenales de Desarrollo Economico (1962-1996)",
      "Inversion del 4-5% del PIB en educacion",
      "Estrategia de industrializacion orientada a exportaciones",
      "Politica de ciencia y tecnologia con apoyo estatal a I+D",
      "Digitalizacion del sistema educativo y gobierno electronico",
    ],
    gdpPerCapita: 34000,
    yearsOfTransformation: "1962-1996",
  },
  {
    country: "Estonia",
    region: "Europa del Este",
    relevance:
      "Pais pequeno que se transformo de estado post-sovietico a lider mundial en gobierno digital. 100% de servicios gubernamentales digitalizados. PIB per capita paso de 3,435 USD (1991) a 32,460 USD (2023).",
    keyReforms: [
      "Identidad digital (e-ID) para el 99% de la poblacion",
      "Plataforma X-Road para intercambio seguro de datos gubernamentales",
      "Principio de recoleccion unica de datos del ciudadano",
      "Digitalizacion completa de servicios publicos",
      "Sector TIC contribuye ~7% del PIB",
    ],
    gdpPerCapita: 32460,
    yearsOfTransformation: "1991-2024",
  },
  {
    country: "Singapur",
    region: "Sudeste Asiatico",
    relevance:
      "Modelo ejemplar de combate a la corrupcion como estrategia de desarrollo. Paso de pais corrupto a uno de los mas limpios del mundo (#3 en CPI). Demuestra que la voluntad politica puede transformar instituciones.",
    keyReforms: [
      "Creacion del CPIB (agencia anticorrupcion independiente, 1952)",
      "Prevention of Corruption Act con alcance publico y privado",
      "Tolerancia cero con la corrupcion desde el nivel mas alto",
      "Salarios competitivos para funcionarios publicos",
      "Confiscacion de ganancias ilicitas como elemento disuasorio",
    ],
    gdpPerCapita: 87900,
    yearsOfTransformation: "1965-2000",
  },
  {
    country: "Ruanda",
    region: "Africa Oriental",
    relevance:
      "Ejemplo de reconstruccion institucional post-conflicto con enfoque en gobernanza, rendicion de cuentas e inclusion de genero. Crecimiento del PIB promedio de 7.4% anual (2000-2023).",
    keyReforms: [
      "Vision 2050 con metas claras de transformacion socioeconomica",
      "Reconstruccion de instituciones con enfasis en gobernanza y rendicion de cuentas",
      "Ampliacion de base tributaria domestica",
      "Politicas de inclusion de genero en todos los niveles de gobierno",
      "Descentralizacion para acercar servicios a los ciudadanos",
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
    notes: "Ultima edicion publicada. El indice fue suspendido desde 2020. Peru se ubica en la mitad inferior a nivel global.",
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
    notes: "Descenso de 2 puntos respecto al ano anterior. Muy por debajo de Chile (63/100, puesto 31). Uno de los paises peor evaluados en la region.",
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
    notes: "Categoria 'desarrollo humano alto'. Chile lidera la region con 0.860 (puesto 44). Peru esta por debajo del promedio de America Latina.",
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
    notes: "Peru se ubica en el puesto 93 de 143 paises. Puesto 29 de 41 entre paises de ingreso medio-alto. Evalua 8 factores incluyendo corrupcion, justicia civil y penal.",
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
    notes: "Ultima edicion publicada (indice descontinuado en 2021). Peru se ubicaba en la mitad superior pero con debilidades en permisos de construccion y registro de propiedad.",
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
    notes: "Promedio OCDE: 472 puntos. Chile lidera la region con 412 puntos. Solo 34% de estudiantes peruanos alcanzan nivel 2 de competencia (vs 69% OCDE). Tendencia positiva de largo plazo.",
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
    notes: "Quinto en America Latina despues de Chile (44), Mexico (56), Colombia (57) y Brasil (62). Cerca del final del ranking global.",
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
    comparison: "Periodo 2005-2014: 6.2% anual. Desaceleracion significativa.",
    source: "Banco Mundial",
    sourceUrl: "https://www.worldbank.org/en/country/peru/overview",
  },
  {
    name: "Informalidad laboral",
    value: "71.65% del empleo total",
    year: 2023,
    comparison: "Chile: ~27% | OCDE: ~15% | Economia informal: ~47% del PIB",
    source: "INEI / WIEGO",
    sourceUrl: "https://www.statista.com/statistics/1039975/informal-employment-share-peru/",
  },
  {
    name: "Recaudacion tributaria (% del PIB)",
    value: "~17%",
    year: 2023,
    comparison: "Promedio LAC: 21.3% | OCDE: 33.8%. Caida de 2.1 pp entre 2022-2023.",
    source: "OECD Revenue Statistics LAC 2025",
    sourceUrl: "https://www.oecd.org/en/publications/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025_2922daa3.html",
  },
  {
    name: "Pobreza monetaria",
    value: "36.2% (< USD 8.30/dia PPP)",
    year: 2024,
    comparison: "Pre-pandemia (2019): 33.6%. Aun por encima de niveles prepandemicos.",
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
    name: "Dependencia minera (% exportaciones)",
    value: "64% de exportaciones",
    year: 2024,
    comparison: "Mineria: ~20% del PIB. Cobre y oro dominan exportaciones.",
    source: "Allianz Trade / EITI",
    sourceUrl: "https://eiti.org/countries/peru",
  },
  {
    name: "Penetracion de internet",
    value: "74.7% de la poblacion",
    year: 2024,
    comparison: "Chile: ~90% | Brecha rural: solo 56.7% conectado vs 83-88% urbano.",
    source: "DataReportal Digital 2024",
    sourceUrl: "https://datareportal.com/reports/digital-2024-peru",
  },
  {
    name: "Cobertura de salud",
    value: "97% asegurados (SIS)",
    year: 2023,
    comparison: "Pero 7 de cada 10 personas que necesitan atencion no la reciben (ENAHO 2022).",
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
      "Sin instituciones que funcionen, nada mas funciona. Si no puedes confiar en que un juez sea justo, o en que un tramite no requiera coima, el pais no avanza. Los paises que salieron de la pobreza (Singapur, Corea, Chile) lo hicieron fortaleciendo sus instituciones primero. Peru ha tenido 6 presidentes en 5 anos — eso no pasa en paises serios.",
    dataPoints: [
      "Peru tuvo 6 presidentes en 5 anos (2016-2021) — inestabilidad record",
      "El mundo nos pone en el puesto 127 de 180 en percepcion de corrupcion",
      "Singapur era mas corrupto que Peru y ahora es top 3 mundial — se puede cambiar",
      "Los paises con instituciones fuertes crecen mas y tienen menos pobreza, segun el Banco Mundial",
    ],
    peruStatus: {
      summary:
        "Las instituciones peruanas estan en crisis. La corrupcion empeora cada ano, nadie confia en los jueces, y la politica es un caos. Mientras Chile y Uruguay mejoran, Peru va para atras.",
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
          notes: "Caida de 2 puntos respecto a 2023. Chile: 63/100 (puesto 31).",
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
          notes: "Puesto 29 de 41 entre paises de ingreso medio-alto.",
        },
      ],
      keyProblems: [
        "La corrupcion empeora cada ano — sacamos 31/100 (Chile saca 63)",
        "Nadie confia en los jueces ni en el Congreso",
        "6 presidentes en 5 anos — inestabilidad politica record",
        "Las reglas del juego cambian segun quien este en el poder",
      ],
    },
    benchmark: {
      country: "Singapur",
      description:
        "Singapur creo el CPIB (agencia anticorrupcion independiente bajo jurisdiccion del Primer Ministro) y aplico tolerancia cero. Combinado con la Prevention of Corruption Act, hizo de la corrupcion una actividad de alto riesgo y baja recompensa.",
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
    name: "Acabar con la Corrupcion",
    nameEn: "Anti-Corruption",
    icon: "ShieldCheck",
    color: "red",
    shortDescription:
      "Que robar al Estado tenga consecuencias reales. Que los funcionarios corruptos vayan presos, no a otro cargo.",
    whyItMatters:
      "La corrupcion es la razon #1 por la que Peru no avanza. Cada sol robado es un hospital que no se construye, una escuela sin techo. Peru saca 31 de 100 en el indice de corrupcion — Chile saca 63, mas del doble. Lo peor: cada ano empeoramos. Pero Singapur demostro que se puede pasar de pais corrupto a uno de los mas limpios del mundo en pocas decadas.",
    dataPoints: [
      "Peru saca 31/100 en corrupcion — Chile saca 63/100, mas del doble",
      "Cada ano Peru baja en el ranking: caimos 2 puntos mas en 2024",
      "Caso Odebrecht: corrupcion en todos los niveles de gobierno",
      "Singapur era corrupto como Peru y ahora es top 3 del mundo — con voluntad politica se puede",
    ],
    peruStatus: {
      summary:
        "Peru es de los paises mas corruptos de America Latina y empeora cada ano. Odebrecht demostro que la corrupcion esta en todos lados. La gente ya no confia en nadie.",
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
          notes: "Tendencia negativa sostenida. Uruguay lidera la region con 72/100.",
        },
      ],
      keyProblems: [
        "31/100 en corrupcion — estamos en el grupo de los peores del mundo",
        "Cada ano sacamos peor nota — vamos para atras",
        "Odebrecht demostro que la corrupcion esta en todos los niveles",
        "Los juicios por corrupcion duran anos y casi nadie va preso",
      ],
    },
    benchmark: {
      country: "Singapur",
      description:
        "Singapur implemento cuatro pilares: leyes fuertes, adjudicacion efectiva, enforcement independiente (CPIB), y administracion publica profesional. Confisca ganancias ilicitas y paga salarios competitivos a funcionarios.",
      keyMetric: "CPI: 83/100 — de pais con corrupcion endemica a top 3 mundial",
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
    name: "Educacion de Verdad",
    nameEn: "Education Quality",
    icon: "GraduationCap",
    color: "emerald",
    shortDescription:
      "Que un chico que sale del colegio sepa leer bien, hacer cuentas y conseguir trabajo. Hoy 2 de cada 3 no pueden.",
    whyItMatters:
      "Sin educacion no hay futuro. Punto. En las pruebas PISA, los estudiantes peruanos sacan 391 en matematicas — el promedio mundial es 472. Solo 1 de cada 3 chicos peruanos puede resolver un problema basico de matematicas. Corea del Sur estaba peor que Peru hace 60 anos y hoy es potencia tecnologica — invirtieron en educacion durante 30 anos seguidos.",
    dataPoints: [
      "Peru saca 391 en matematicas PISA — el promedio mundial es 472 (estamos 81 puntos abajo)",
      "Solo 1 de cada 3 estudiantes puede resolver un problema basico de matematicas",
      "Solo 1% de nuestros estudiantes llega al nivel avanzado en lectura (en la OCDE es 7%)",
      "Corea del Sur invirtio 5% del PIB en educacion por 30 anos y paso de pobre a potencia",
    ],
    peruStatus: {
      summary:
        "Nuestros chicos salen del colegio sin las herramientas basicas. Estamos muy por debajo del mundo en todas las materias. Algo esta mejorando, pero a paso de tortuga.",
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
        "Solo 1 de cada 3 chicos resuelve un problema basico de matematicas",
        "Estamos 81 puntos abajo del promedio mundial en PISA",
        "Un chico de Lima aprende mucho mas que uno del campo",
        "Invertimos poco en educacion comparado con los paises que si crecieron",
      ],
    },
    benchmark: {
      country: "Corea del Sur",
      description:
        "Corea del Sur invirtio consistentemente 4-5% de su PIB en educacion durante 30+ anos, creo planes de educacion alineados con sus planes de desarrollo economico, y uso tecnologia educativa desde etapas tempranas. PISA 2022: Matematicas 527, Lectura 515.",
      keyMetric: "PISA Matematicas: 527 puntos (Peru: 391)",
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
      "Que llegue agua limpia a todos, que las carreteras conecten el pais, y que internet no sea un lujo.",
    whyItMatters:
      "Sin carreteras no hay comercio. Sin agua limpia no hay salud. Sin internet no hay futuro. En Peru, solo 2 de cada 10 hogares rurales tienen internet fijo. Hay pueblos donde el agua llega turbia o no llega. Mientras tanto, los proyectos de infraestructura se atrasan anos por corrupcion en las licitaciones.",
    dataPoints: [
      "Solo 2 de cada 10 hogares rurales tienen internet fijo (en la ciudad son 9 de 10)",
      "Proyectos de infraestructura con anos de atraso y sobrecostos por corrupcion",
      "Hay pueblos sin agua potable ni desague fuera de las ciudades principales",
      "Chile tiene la mejor logistica de transporte de America Latina — Peru esta lejos",
    ],
    peruStatus: {
      summary:
        "Fuera de Lima, Peru es otro pais. Carreteras que no existen, pueblos sin agua, internet que no llega. Los proyectos se atrasan anos y cuestan el doble por corrupcion.",
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
          notes: "Infraestructura es una de las areas mas debiles de Peru en el GCI. Score general 61.7/100.",
        },
      ],
      keyProblems: [
        "Fuera de Lima parece otro pais — sin carreteras, sin agua, sin internet",
        "Los proyectos se atrasan anos por corrupcion en las licitaciones",
        "Solo 2 de cada 10 hogares rurales tienen internet",
        "Hay pueblos donde el agua no llega o llega sucia",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile invirtio en infraestructura de transporte y concesiones publico-privadas de manera consistente. Tiene la mejor infraestructura logistica de America Latina segun el LPI del Banco Mundial.",
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
      "Que puedas hacer tramites desde tu celular sin hacer cola. Que el Estado use tecnologia en vez de papel.",
    whyItMatters:
      "En Estonia, el 100% de tramites del gobierno se hacen online — no hay colas, no hay coimas, no hay papeles. En Peru todavia hay que ir a una oficina, hacer cola y rezar. La digitalizacion reduce corrupcion (todo queda registrado), ahorra plata al Estado y le facilita la vida a la gente. Peru esta por debajo de Brasil, Mexico, Chile, Colombia y Argentina en desarrollo digital.",
    dataPoints: [
      "En Estonia puedes hacer TODO online — en Peru todavia hay colas para todo",
      "75% de peruanos tiene internet, pero en zonas rurales solo 57%",
      "Peru esta por debajo de Brasil, Mexico, Chile, Colombia y Argentina en lo digital",
      "Estonia paso de pais pobre a tener el 7% de su economia en tecnologia — se puede",
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
          notes: "Peru clasificado con nivel medio de desarrollo digital en America Latina. Debilidades en competencias TIC y marcos regulatorios.",
        },
      ],
      keyProblems: [
        "En el campo, solo la mitad tiene internet — en la ciudad casi todos",
        "Solo 2 de cada 10 hogares rurales con internet fijo",
        "Estamos por debajo de Brasil, Mexico, Chile, Colombia y Argentina en lo digital",
        "La mayoria de tramites del Estado todavia requieren ir fisicamente a una oficina",
      ],
    },
    benchmark: {
      country: "Estonia",
      description:
        "Estonia digitalizo el 100% de sus servicios gubernamentales, creo identidad digital para el 99% de la poblacion, e implemento X-Road para intercambio seguro de datos. Su PIB per capita paso de USD 3,435 a USD 32,460 entre 1991 y 2023.",
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
    name: "No Solo Mineria",
    nameEn: "Economic Diversification & Productivity",
    icon: "TrendingUp",
    color: "orange",
    shortDescription:
      "Peru vive de la mineria. Si baja el precio del cobre, nos hundimos. Necesitamos crear otras industrias y formalizar empleos.",
    whyItMatters:
      "El 64% de lo que Peru exporta son metales. Si manana baja el precio del cobre, se nos cae la economia. Ademas, 7 de cada 10 peruanos trabajan en la informalidad — sin seguro, sin jubilacion, sin derechos. Chile diversifico hacia servicios, agroindustria y tecnologia. Peru se quedo en la mineria y en el crecimiento paso de 6% a 2% anual.",
    dataPoints: [
      "64% de lo que exportamos son metales — demasiado huevo en una sola canasta",
      "7 de cada 10 peruanos trabajan sin contrato, sin seguro, sin derechos",
      "La economia informal es casi la mitad del PIB — plata que no paga impuestos",
      "Antes creciamos 6% al ano, ahora solo 2.4% — nos estamos frenando",
      "Chile diversifico su economia y su PIB per capita es el doble que el nuestro",
    ],
    peruStatus: {
      summary:
        "Vivimos de la mineria y de la informalidad. Si el cobre baja, nos hundimos. 7 de cada 10 trabajan sin derechos. El crecimiento se freno a la mitad.",
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
          notes: "Quinto en LAC despues de Chile (44), Mexico (56), Colombia (57) y Brasil (62). Cerca del final del ranking global.",
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
          notes: "Pilar de Innovacion y Dinamismo Empresarial entre los mas debiles.",
        },
      ],
      keyProblems: [
        "64% de lo que exportamos son metales — si baja el cobre, nos hundimos",
        "7 de cada 10 trabajan informal — sin contrato, sin seguro, sin futuro",
        "Casi la mitad del PIB es informal — plata invisible para el Estado",
        "El crecimiento se freno a la mitad: de 6% a 2.4% anual",
        "Chile gana el doble que nosotros per capita — y eramos similares",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile diversifico mas alla de la mineria hacia servicios financieros, agroindustria, energia renovable y tecnologia. Mantuvo apertura comercial con multiples TLCs y reformas pro-empresa.",
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
      "El 97% tiene seguro de salud en papel, pero 7 de cada 10 no reciben atencion cuando la necesitan. Eso no es salud.",
    whyItMatters:
      "Tener un carnet del SIS no sirve si cuando te enfermas no hay cama, no hay doctor o te hacen esperar semanas. En Peru, 7 de cada 10 personas que necesitan atencion medica NO la reciben. En Puno es el doble de grave que en Lima. Un pais donde la gente se muere por falta de atencion no puede crecer.",
    dataPoints: [
      "7 de cada 10 peruanos que necesitan atencion medica NO la reciben",
      "35% no va al doctor porque los tiempos de espera son eternas",
      "En Puno la falta de atencion es el doble que en Lima (40% vs 23%)",
      "Vivimos 72 anos en promedio — un chileno vive 79, casi 7 anos mas",
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
          notes: "Esperanza de vida: 72.4 anos. Chile: 78.9 anos.",
        },
      ],
      keyProblems: [
        "7 de cada 10 que necesitan doctor NO lo consiguen",
        "El sistema esta partido en pedazos — SIS, EsSalud, clinicas, y ninguno se habla",
        "En Puno la gente se queda sin atencion el doble que en Lima",
        "Las mujeres sufren mas — 33% sin atencion vs 29% de hombres",
        "Peru gasta menos en salud que cualquier otro pais de la region",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene un sistema de salud mixto (FONASA/ISAPRE) con mejor integracion y cobertura efectiva. Esperanza de vida de 78.9 anos. Inversion en salud como porcentaje del PIB significativamente mayor.",
      keyMetric: "Esperanza de vida Chile: 78.9 anos vs Peru: 72.4 anos",
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
    name: "Que Nadie se Quede Atras",
    nameEn: "Social Inclusion & Inequality Reduction",
    icon: "Users",
    color: "teal",
    shortDescription:
      "4 de cada 10 peruanos son pobres. La mitad no come bien. Un chico en Lima tiene 3 veces mas oportunidades que uno en Huancavelica.",
    whyItMatters:
      "36% de peruanos vive en pobreza y mas de la mitad no come lo suficiente. Si naciste en Lima, tus oportunidades son 3 veces mayores que si naciste en los Andes o la Amazonia. La pandemia borro anos de progreso — la pobreza salto de 20% a 30% de un ano a otro. Un pais donde la mitad sufre no puede avanzar.",
    dataPoints: [
      "36% de peruanos son pobres — con menos de 30 soles al dia",
      "Mas de la mitad de peruanos no come bien (inseguridad alimentaria)",
      "La pandemia borro anos de progreso: pobreza salto de 20% a 30% en un ano",
      "Un chico de Lima tiene 3 veces mas oportunidades que uno del campo",
    ],
    peruStatus: {
      summary:
        "Habiamos avanzado, pero la pandemia nos devolvio anos atras. La pobreza todavia esta peor que antes del COVID. Y si vives fuera de Lima, todo es peor.",
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
        "Mas de la mitad de peruanos no come lo suficiente",
        "La desigualdad es de las mas altas de America Latina",
        "Si naces fuera de Lima, tus chances de salir adelante son mucho menores",
      ],
    },
    benchmark: {
      country: "Ruanda",
      description:
        "Ruanda integro politicas de inclusion de genero en todos los niveles de gobierno y priorizo la equidad territorial a traves de la descentralizacion. Crecimiento del PIB promedio de 7.4% anual (2000-2023).",
      keyMetric: "Primer pais del mundo en representacion femenina parlamentaria (61%)",
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
      "Peru recauda la mitad de lo que necesita. Sin plata no hay hospitales, ni colegios, ni carreteras. Y la informalidad hace que casi nadie pague impuestos.",
    whyItMatters:
      "El Estado peruano recauda 17% del PIB en impuestos — los paises desarrollados recaudan 34%, el doble. Sin plata no puedes construir hospitales, pagar buenos profesores ni hacer carreteras. La razon principal: 7 de cada 10 trabajan en la informalidad y no pagan impuestos. Es un circulo vicioso: el Estado no recauda, entonces no da buenos servicios, entonces la gente no quiere pagar.",
    dataPoints: [
      "Peru recauda 17% del PIB — los paises desarrollados recaudan 34%, el doble",
      "Somos de los que menos recaudamos en toda America Latina",
      "En 2023 recaudamos aun MENOS que en 2022 — vamos para atras",
      "7 de cada 10 trabajan informal y no pagan impuestos — el Estado se queda sin plata",
    ],
    peruStatus: {
      summary:
        "El Estado no tiene plata porque casi nadie paga impuestos. Recaudamos la mitad de lo que necesitamos. Y cada ano recaudamos menos, no mas.",
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
          notes: "Mayor caida de la region: -2.1 pp entre 2022 y 2023. OCDE promedio: 33.8%.",
        },
      ],
      keyProblems: [
        "Recaudamos la mitad de lo que necesitamos — 17% vs 34% de paises desarrollados",
        "En 2023 recaudamos MENOS que en 2022 — la peor caida de la region",
        "7 de cada 10 trabajan informal — no pagan impuestos",
        "Dependemos de la mineria para los ingresos — y los precios suben y bajan",
        "No hay plata para hospitales, colegios ni carreteras porque no recaudamos",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene una recaudacion tributaria alrededor del 21% del PIB, con reformas tributarias progresivas, una administracion fiscal mas eficiente y menor informalidad (~27% del empleo).",
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
      "La inseguridad es la preocupacion #1 de los peruanos. Pero no basta con mas policias — necesitas jueces que no se vendan, carceles que rehabiliten y un sistema que funcione. Peru esta en el puesto 93 de 143 en estado de derecho. Si denuncias un robo, no pasa nada. Si un politico roba, tampoco. Asi no se construye un pais.",
    dataPoints: [
      "Peru esta en el puesto 93 de 143 paises en estado de derecho — en el tercio mas bajo",
      "La inseguridad es la preocupacion #1 de los peruanos segun todas las encuestas",
      "Si denuncias un robo, la probabilidad de que se resuelva es minima",
      "En Lima la justicia funciona (mas o menos) — en provincias es casi inexistente",
    ],
    peruStatus: {
      summary:
        "La gente tiene miedo de salir a la calle. La policia no da abasto. Los jueces no inspiran confianza. Y si vives en provincia, la justicia casi no existe.",
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
          notes: "Puesto 29 de 41 entre paises de ingreso medio-alto. Evalua justicia civil, penal, corrupcion y derechos fundamentales.",
        },
      ],
      keyProblems: [
        "La inseguridad es lo que mas preocupa a los peruanos",
        "Si te roban y denuncias, casi nunca pasa nada",
        "Los jueces no inspiran confianza — presion politica y mediatica",
        "En provincias casi no hay acceso a justicia",
        "Estamos en el puesto 93 de 143 paises en estado de derecho",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene un sistema judicial mas independiente y eficiente, con reformas procesales penales exitosas. Se ubica en el puesto 27 del WJP Rule of Law Index, entre los mejores de America Latina junto con Uruguay y Costa Rica.",
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
    critico: "Critico",
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
