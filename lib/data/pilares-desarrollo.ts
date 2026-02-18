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
    name: "Fortaleza Institucional y Estado de Derecho",
    nameEn: "Institutional Strength & Rule of Law",
    icon: "Landmark",
    color: "blue",
    shortDescription:
      "Instituciones solidas, independencia judicial, capacidad del Estado y estado de derecho predecible.",
    whyItMatters:
      "Segun el WEF, las instituciones son el primer pilar de la competitividad porque determinan las reglas del juego. El Banco Mundial mide 6 dimensiones de gobernanza que correlacionan directamente con desarrollo economico. Los economistas Acemoglu y Robinson demuestran que instituciones inclusivas son el factor diferenciador entre naciones prosperas y fallidas.",
    dataPoints: [
      "El WEF GCI 4.0 coloca 'Instituciones' como Pilar 1 de sus 12 pilares de competitividad",
      "El Banco Mundial mide 6 dimensiones de gobernanza en 214 economias (WGI)",
      "El World Justice Project evalua 47 indicadores de estado de derecho en 143 paises",
      "Singapur paso de pais corrupto a top 3 mundial en CPI creando una agencia anticorrupcion independiente",
    ],
    peruStatus: {
      summary:
        "Peru enfrenta una crisis institucional severa. La percepcion de corrupcion empeora anualmente, el estado de derecho se debilita y la confianza ciudadana en instituciones esta entre las mas bajas de la region.",
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
        "Corrupcion percibida en aumento: 31/100 en CPI 2024 (puesto 127/180)",
        "Estado de derecho debil: puesto 93/143 en WJP Rule of Law Index 2025",
        "Sistema judicial con baja confianza ciudadana y presion mediatica sobre jueces",
        "Inestabilidad politica cronica: 6 presidentes en 5 anos (2016-2021)",
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
    name: "Lucha Contra la Corrupcion",
    nameEn: "Anti-Corruption",
    icon: "ShieldCheck",
    color: "red",
    shortDescription:
      "Mecanismos efectivos de prevencion, deteccion y sancion de la corrupcion en los sectores publico y privado.",
    whyItMatters:
      "Transparency International, el Banco Mundial y el WEF coinciden en que la corrupcion es el principal destructor de confianza institucional y competitividad. El CPI muestra una correlacion directa entre corrupcion y pobreza. Peru pierde posiciones cada ano, alejandose de sus pares regionales.",
    dataPoints: [
      "Peru: 31/100 en CPI 2024, cayendo 2 puntos en un ano (puesto 127/180)",
      "Chile: 63/100 en CPI 2024 (puesto 31), mas del doble del puntaje de Peru",
      "Ausencia de Corrupcion es un factor clave tanto en el WJP Rule of Law Index como en el WGI del Banco Mundial",
      "Singapur demostro que la corrupcion endemica puede eliminarse en pocas decadas con voluntad politica",
    ],
    peruStatus: {
      summary:
        "Peru tiene uno de los peores indices de percepcion de corrupcion de America Latina, con una tendencia decreciente. Los casos Odebrecht y la inestabilidad politica han erosionado la confianza ciudadana.",
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
        "Score de 31/100 en CPI: en el tercio inferior a nivel global",
        "Tendencia descendente: Peru pierde puntos ano tras ano",
        "Caso Odebrecht revelo corrupcion sistemica en multiples niveles de gobierno",
        "Alta impunidad: procesos judiciales por corrupcion tardan anos sin resolverse",
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
    name: "Calidad Educativa",
    nameEn: "Education Quality",
    icon: "GraduationCap",
    color: "emerald",
    shortDescription:
      "Educacion basica de calidad, formacion tecnica alineada con el mercado laboral, e inversion en capital humano.",
    whyItMatters:
      "El WEF identifica 'Habilidades' como uno de sus 12 pilares de competitividad. El IDH del PNUD usa educacion como 1 de sus 3 dimensiones. PISA de la OCDE mide la calidad educativa real. Corea del Sur demostro que la inversion en educacion transforma economias en una generacion.",
    dataPoints: [
      "Peru PISA 2022: Matematicas 391 (OCDE: 472), Lectura 408 (OCDE: 476)",
      "Solo 34% de estudiantes peruanos alcanzan nivel 2 en matematicas (vs 69% en la OCDE)",
      "Solo 1% de estudiantes peruanos alcanzan nivel 5 en lectura (vs 7% OCDE)",
      "Corea del Sur invirtio 4-5% de PIB en educacion consistentemente durante 30 anos y paso de pais pobre a economia del conocimiento",
    ],
    peruStatus: {
      summary:
        "Los resultados PISA muestran que Peru esta significativamente por debajo del promedio OCDE en todas las materias. Existe una tendencia positiva de largo plazo, pero la brecha con paises desarrollados sigue siendo enorme.",
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
        "Puntajes PISA muy por debajo del promedio OCDE en las tres materias",
        "Solo 34% alcanza nivel minimo de competencia en matematicas (OCDE: 69%)",
        "Brecha urbano-rural significativa en resultados educativos",
        "Baja inversion en educacion relativa al PIB comparado con paises exitosos",
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
    name: "Infraestructura y Conectividad",
    nameEn: "Infrastructure & Connectivity",
    icon: "Building2",
    color: "amber",
    shortDescription:
      "Transporte, energia, agua, saneamiento y conectividad digital como base del crecimiento economico.",
    whyItMatters:
      "El WEF designa Infraestructura como Pilar 2 de competitividad. El Banco Mundial mide la calidad logistica a traves del LPI. La brecha de infraestructura limita la productividad, encarece el comercio y profundiza la desigualdad territorial. Peru tiene deficiencias criticas en infraestructura vial, portuaria y de saneamiento.",
    dataPoints: [
      "Infraestructura es el Pilar 2 del WEF GCI 4.0 (de 12 pilares)",
      "El Logistics Performance Index del Banco Mundial evalua la calidad de infraestructura de transporte y comercio",
      "Peru: brecha de acceso a agua potable y saneamiento persiste en zonas rurales",
      "Solo 21.7% de hogares rurales tiene internet fijo, vs ~88% urbano",
    ],
    peruStatus: {
      summary:
        "Peru tiene brechas significativas en infraestructura vial, portuaria, de saneamiento y digital, especialmente fuera de Lima. El gasto en infraestructura ha sido insuficiente y los proyectos sufren demoras cronicas.",
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
        "Brecha critica de infraestructura rural vs urbana",
        "Proyectos de infraestructura con demoras cronicas y sobrecostos (corrupcion en licitaciones)",
        "Solo 21.7% de hogares rurales con internet fijo",
        "Deficiencias en saneamiento: acceso a agua potable limitado fuera de ciudades principales",
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
    name: "Transformacion Digital y Gobierno Electronico",
    nameEn: "Digital Transformation & E-Government",
    icon: "MonitorSmartphone",
    color: "violet",
    shortDescription:
      "Digitalizacion de servicios publicos, conectividad universal, economia digital y competencias digitales ciudadanas.",
    whyItMatters:
      "El WEF incluye 'Adopcion de TIC' como Pilar 3 de competitividad. El IMD tiene un ranking especifico de competitividad digital. Estonia demostro que la digitalizacion reduce burocracia, corrupcion y costos gubernamentales, mientras mejora la transparencia y eficiencia.",
    dataPoints: [
      "Adopcion de TIC es el Pilar 3 del WEF GCI 4.0",
      "Estonia: 100% de servicios gubernamentales en linea, sector TIC = 7% del PIB",
      "Peru: 74.7% de penetracion de internet, pero brecha rural significativa (56.7% rural vs 83-88% urbano)",
      "Peru tiene nivel 'medio' de desarrollo digital en la region, debajo de Brasil, Mexico, Chile, Colombia y Argentina",
    ],
    peruStatus: {
      summary:
        "Peru ha avanzado en penetracion de internet y gobierno electronico basico (SUNAT, SIS), pero la brecha digital urbano-rural persiste. El pais tiene nivel medio de desarrollo digital en la region, por debajo de sus principales pares.",
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
        "Brecha digital urbano-rural: 56.7% rural vs 83-88% urbano conectado",
        "Solo 21.7% de hogares rurales con internet fijo",
        "Clasificado por debajo de Brasil, Mexico, Chile, Colombia y Argentina en desarrollo digital",
        "Debilidades en competencias digitales de la poblacion y marcos regulatorios TIC",
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
    name: "Diversificacion Economica y Productividad",
    nameEn: "Economic Diversification & Productivity",
    icon: "TrendingUp",
    color: "orange",
    shortDescription:
      "Reduccion de la dependencia minera, formalizacion del empleo, innovacion empresarial y desarrollo de nuevos sectores productivos.",
    whyItMatters:
      "El WEF mide Dinamismo Empresarial (Pilar 11) y Capacidad de Innovacion (Pilar 12) como motores de productividad. Peru depende excesivamente de la mineria (64% de exportaciones) y tiene una informalidad del 71.65%. La diversificacion economica es esencial para un crecimiento resiliente y generacion de empleo de calidad.",
    dataPoints: [
      "64% de las exportaciones de Peru son metales y minerales",
      "71.65% del empleo es informal (2023)",
      "La economia informal representa ~47% del PIB",
      "Recaudacion tributaria: 17% del PIB vs 33.8% OCDE y 21.3% promedio LAC",
      "Crecimiento economico desacelero: 6.2% (2005-2014) a 2.4% (2015-2024)",
    ],
    peruStatus: {
      summary:
        "Peru sigue altamente dependiente de la mineria para exportaciones y crecimiento. La informalidad laboral es de las mas altas de la region, la recaudacion tributaria esta muy por debajo de la OCDE, y la productividad se ha estancado.",
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
        "Dependencia minera: 64% de exportaciones son metales y minerales",
        "Informalidad laboral: 71.65% del empleo (2023) — una de las mas altas de LAC",
        "Economia informal ~47% del PIB, erosionando la base tributaria",
        "Recaudacion tributaria: 17% del PIB, muy por debajo de la OCDE (33.8%) y LAC (21.3%)",
        "Crecimiento desacelerado: de 6.2% a 2.4% promedio anual",
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
    name: "Salud Publica y Proteccion Social",
    nameEn: "Healthcare & Social Protection",
    icon: "HeartPulse",
    color: "rose",
    shortDescription:
      "Acceso efectivo a salud de calidad, no solo cobertura en papel. Sistema integrado que elimine brechas regionales y de genero.",
    whyItMatters:
      "El WEF incluye 'Salud' como Pilar 5 de competitividad. El IDH del PNUD usa esperanza de vida como dimension clave. La OCDE evalua el sistema de salud peruano y encuentra cobertura nominal alta pero acceso efectivo muy bajo. Una poblacion sana es prerequisito para productividad y desarrollo.",
    dataPoints: [
      "97% de peruanos tienen seguro de salud (SIS), pero 7 de cada 10 no reciben atencion cuando la necesitan (ENAHO 2022)",
      "35% cita tiempos de espera como razon principal de no recibir atencion",
      "En Puno, necesidades medicas no atendidas son casi el doble que en Lima (40% vs 23%)",
      "Esperanza de vida: 72.4 anos (2022), mejora de 13 anos desde 1980",
    ],
    peruStatus: {
      summary:
        "Peru logro una cobertura de salud nominal del 97%, pero el sistema esta fragmentado y el acceso efectivo es muy bajo. 7 de cada 10 personas que necesitan atencion no la reciben. Hay brechas enormes entre Lima y regiones.",
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
        "7 de cada 10 personas que necesitan atencion medica no la reciben",
        "Sistema fragmentado: multiples subsistemas publicos sin integracion",
        "Brecha regional: necesidades no atendidas en Puno (40%) duplican a Lima (23%)",
        "Brecha de genero: mujeres reportan mas necesidades no atendidas (33% vs 29%)",
        "Peru esta ultimo en gasto en salud como % del PIB entre paises de la region",
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
    name: "Inclusion Social y Reduccion de Desigualdad",
    nameEn: "Social Inclusion & Inequality Reduction",
    icon: "Users",
    color: "teal",
    shortDescription:
      "Reduccion de brechas de pobreza, desigualdad territorial, genero y acceso a oportunidades para todos los peruanos.",
    whyItMatters:
      "El IDH del PNUD y el Better Life Index de la OCDE miden multiples dimensiones de bienestar e inclusion. La desigualdad frena el crecimiento y genera inestabilidad social. El 36.2% de peruanos vive en pobreza y mas de la mitad enfrenta inseguridad alimentaria. Ruanda demostro que politicas de inclusion de genero pueden ser parte central de una estrategia de desarrollo.",
    dataPoints: [
      "36.2% de peruanos vive con menos de USD 8.30/dia (2024)",
      "Gini de 40.1 indica desigualdad moderada-alta",
      "La pandemia hizo retroceder anos de progreso: pobreza salto de 20.2% (2019) a 30.1% (2020)",
      "Brechas enormes entre Lima metropolitana y regiones andinas/amazonicas en todos los indicadores",
    ],
    peruStatus: {
      summary:
        "Peru hizo progresos significativos en reduccion de pobreza (2005-2019), pero la pandemia revirtio mucho del avance. La pobreza aun esta por encima de niveles prepandemicos y las brechas regionales son enormes.",
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
        "36.2% vive en pobreza monetaria (2024), aun por encima de niveles prepandemicos (33.6% en 2019)",
        "Mas de la mitad de la poblacion enfrenta inseguridad alimentaria",
        "Gini de 40.1: desigualdad moderada-alta",
        "Enorme brecha entre Lima y regiones en acceso a salud, educacion e internet",
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
    name: "Capacidad Fiscal y Gestion Publica",
    nameEn: "Fiscal Capacity & Public Management",
    icon: "Wallet",
    color: "cyan",
    shortDescription:
      "Recaudacion tributaria suficiente, gasto publico eficiente, y capacidad del Estado para financiar servicios esenciales y proyectos de desarrollo.",
    whyItMatters:
      "El WEF mide la estabilidad macroeconomica (Pilar 4) y el Banco Mundial la efectividad del gobierno. Peru recauda solo 17% del PIB en impuestos, lejos del promedio OCDE (33.8%) y LAC (21.3%). Sin capacidad fiscal no hay educacion, salud ni infraestructura de calidad. Ruanda demostro que ampliar la base tributaria es fundamental para reducir dependencia de ayuda externa.",
    dataPoints: [
      "Peru recauda ~17% del PIB en impuestos (2023), el mas bajo de la region junto con algunos paises centroamericanos",
      "Promedio OCDE: 33.8% | Promedio LAC: 21.3%",
      "Caida de 2.1 puntos porcentuales en la ratio impuestos/PIB entre 2022 y 2023",
      "La informalidad (71.65% del empleo) erosiona masivamente la base tributaria",
    ],
    peruStatus: {
      summary:
        "Peru tiene una de las recaudaciones tributarias mas bajas de America Latina (17% del PIB), muy por debajo de la OCDE (33.8%) y el promedio regional (21.3%). La alta informalidad y la caida de precios de commodities agravan la situacion.",
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
        "Recaudacion de 17% del PIB: casi la mitad del promedio OCDE",
        "Caida de 2.1 pp (la mayor de la region) entre 2022 y 2023",
        "Informalidad del 71.65% erosiona la base tributaria",
        "Ingresos no tributarios de solo 0.4% del PIB (el mas bajo de LAC)",
        "Alta dependencia de ingresos mineros que fluctuan con precios internacionales",
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
    name: "Seguridad Ciudadana y Acceso a Justicia",
    nameEn: "Citizen Security & Access to Justice",
    icon: "Scale",
    color: "indigo",
    shortDescription:
      "Seguridad publica efectiva, sistema judicial eficiente e independiente, y acceso a justicia para todos los ciudadanos.",
    whyItMatters:
      "El WJP Rule of Law Index mide justicia civil y penal como dos de sus 8 factores. El WEF incluye seguridad en su evaluacion institucional. El Banco Mundial mide estabilidad politica y ausencia de violencia. Sin seguridad y justicia, no hay inversion, no hay confianza institucional, y la desigualdad se perpetua.",
    dataPoints: [
      "Peru: puesto 93/143 en el WJP Rule of Law Index 2025",
      "El WJP evalua justicia civil y justicia penal como factores independientes del estado de derecho",
      "El Banco Mundial mide 'Estabilidad politica y ausencia de violencia' como dimension de gobernanza",
      "El sistema judicial peruano tiene 1,838 juzgados de paz pero baja confianza ciudadana",
    ],
    peruStatus: {
      summary:
        "Peru enfrenta problemas graves de inseguridad ciudadana y un sistema judicial con baja confianza publica, alta carga procesal y presion mediatica sobre jueces. El acceso a justicia es desigual territorialmente.",
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
        "Baja confianza ciudadana en el sistema judicial",
        "Presion mediatica sobre jueces afecta independencia judicial",
        "Puesto 93/143 en Rule of Law Index: en el tercio inferior global",
        "Acceso a justicia desigual: mucho mejor en Lima que en regiones",
        "Inseguridad ciudadana percibida entre las principales preocupaciones de los peruanos",
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
