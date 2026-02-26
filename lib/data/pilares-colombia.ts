// PILARES DE DESARROLLO — Framework de pilares clave para el crecimiento de Colombia
// Basado en: WEF Global Competitiveness Index, World Bank Worldwide Governance Indicators,
// UNDP Human Development Index, OECD Better Life Index, World Justice Project Rule of Law Index,
// Transparency International CPI, PISA (OECD), IMD World Competitiveness Ranking, DANE

import type {
  DevelopmentPillar,
  PeruRanking,
  EconomicIndicator,
  BenchmarkCountry,
} from "./pilares-desarrollo";

// =============================================================================
// BENCHMARK COUNTRIES FOR COLOMBIA
// =============================================================================

export const colombiaBenchmarkCountries: BenchmarkCountry[] = [
  {
    country: "Chile",
    region: "América Latina",
    relevance:
      "Vecino exitoso con contexto regional similar. Líder en desarrollo humano (IDH #44), control de corrupción (CPI: 63/100) y competitividad en LAC. Demuestra que el progreso institucional es posible en la región.",
    keyReforms: [
      "Autonomía del Banco Central (1989)",
      "Agencia de Calidad y Superintendencia de Educación",
      "Fortalecimiento de derechos de propiedad y seguridad jurídica",
      "Apertura comercial con tratados de libre comercio",
      "Sistema de evaluación docente basado en mérito",
    ],
    gdpPerCapita: 17200,
    yearsOfTransformation: "1985-2010",
  },
  {
    country: "Uruguay",
    region: "América Latina",
    relevance:
      "Mejor gobernanza de América Latina. Lidera la región en transparencia (CPI: 72/100), democracia y estado de derecho. Modelo de institucionalidad sólida en un país pequeño.",
    keyReforms: [
      "Fortalecimiento de la Junta de Transparencia y Ética Pública (JUTEP)",
      "Sistema de partidos estable y democrático",
      "Inversión sostenida en educación pública",
      "Políticas sociales universales con amplia cobertura",
      "Regulación innovadora (cannabis, energías renovables)",
    ],
    gdpPerCapita: 22800,
    yearsOfTransformation: "2000-2020",
  },
  {
    country: "Costa Rica",
    region: "Centroamérica",
    relevance:
      "Modelo centroamericano de inversión en educación y salud. Abolió el ejército en 1948 y redirigió esos recursos a desarrollo social. Esperanza de vida comparable a países desarrollados.",
    keyReforms: [
      "Abolición del ejército y redirección de recursos a educación y salud (1948)",
      "Cobertura de salud universal a través de la CCSS",
      "Inversión sostenida en educación (~7% del PIB)",
      "Protección ambiental como política de Estado",
      "Atracción de inversión extranjera en alta tecnología",
    ],
    gdpPerCapita: 13200,
    yearsOfTransformation: "1948-2000",
  },
  {
    country: "Corea del Sur",
    region: "Asia Oriental",
    relevance:
      "Modelo de transformación educativa y tecnológica. Pasó de país pobre a economía avanzada en 30 años, impulsado por inversión masiva en educación, ciencia y tecnología.",
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
      "Líder mundial en gobierno digital y digitalización. 100% de servicios gubernamentales en línea. Transformación post-soviética exitosa con enfoque en tecnología e innovación.",
    keyReforms: [
      "Identidad digital (e-ID) para el 99% de la población",
      "Plataforma X-Road para intercambio seguro de datos gubernamentales",
      "Principio de recolección única de datos del ciudadano",
      "Digitalización completa de servicios públicos",
      "Sector TIC contribuye ~7% del PIB",
    ],
    gdpPerCapita: 32460,
    yearsOfTransformation: "1991-2024",
  },
];

// =============================================================================
// COLOMBIA RANKINGS OVERVIEW
// =============================================================================

export const colombiaRankings: PeruRanking[] = [
  {
    indexName: "Global Competitiveness Index 4.0",
    organization: "World Economic Forum",
    year: 2019,
    rank: 57,
    totalCountries: 141,
    score: 62.7,
    maxScore: 100,
    trend: "estable",
    sourceUrl: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
    notes: "Última edición publicada. Colombia se ubica en la mitad del ranking global, cuarto en LAC después de Chile (33), México (48) y Uruguay (54).",
  },
  {
    indexName: "Corruption Perceptions Index",
    organization: "Transparency International",
    year: 2024,
    rank: 91,
    totalCountries: 180,
    score: 39,
    maxScore: 100,
    trend: "estable",
    sourceUrl: "https://www.transparency.org/en/cpi/2024/index/col",
    notes: "Por encima de Perú (31/100, puesto 127) pero muy lejos de Chile (63/100, puesto 31) y Uruguay (72/100, puesto 18).",
  },
  {
    indexName: "Human Development Index",
    organization: "PNUD",
    year: 2022,
    rank: 88,
    totalCountries: 193,
    score: 0.758,
    maxScore: 1.0,
    trend: "estable",
    sourceUrl: "https://hdr.undp.org/data-center/human-development-index",
    notes: "Categoría 'desarrollo humano alto'. Chile lidera la región con 0.860 (puesto 44). Colombia está ligeramente por debajo del promedio LAC.",
  },
  {
    indexName: "Rule of Law Index",
    organization: "World Justice Project",
    year: 2025,
    rank: 89,
    totalCountries: 143,
    score: null,
    maxScore: 1.0,
    trend: "estable",
    sourceUrl: "https://worldjusticeproject.org/rule-of-law-index/country/Colombia",
    notes: "Colombia se ubica en el puesto 89 de 143 países. Debilidades en justicia penal, orden y seguridad por el conflicto armado.",
  },
  {
    indexName: "Ease of Doing Business",
    organization: "Banco Mundial",
    year: 2020,
    rank: 67,
    totalCountries: 190,
    score: null,
    maxScore: 100,
    trend: "mejorando",
    sourceUrl: "https://archive.doingbusiness.org/en/rankings",
    notes: "Última edición publicada (índice descontinuado en 2021). Colombia se ubicaba entre los mejores de LAC, con fortalezas en protección a inversionistas.",
  },
  {
    indexName: "PISA 2022 (Matemáticas)",
    organization: "OECD",
    year: 2022,
    rank: null,
    totalCountries: 81,
    score: 383,
    maxScore: 600,
    trend: "estable",
    sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/colombia_ed6fbcc5-en.html",
    notes: "Promedio OCDE: 472 puntos. Chile lidera la región con 412 puntos. Solo ~35% de estudiantes colombianos alcanzan nivel 2 de competencia (vs 69% OCDE).",
  },
  {
    indexName: "PISA 2022 (Lectura)",
    organization: "OECD",
    year: 2022,
    rank: null,
    totalCountries: 81,
    score: 411,
    maxScore: 600,
    trend: "estable",
    sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/colombia_ed6fbcc5-en.html",
    notes: "Promedio OCDE: 476 puntos. Colombia está 65 puntos por debajo del promedio OCDE. Mejor que Perú (408) pero lejos de Chile (448).",
  },
  {
    indexName: "IMD World Competitiveness Ranking",
    organization: "IMD Business School",
    year: 2024,
    rank: 57,
    totalCountries: 67,
    score: null,
    maxScore: 100,
    trend: "estable",
    sourceUrl: "https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/",
    notes: "Tercero en América Latina después de Chile (44) y México (56). Mejor que Brasil (62) y Perú (63).",
  },
];

// =============================================================================
// KEY ECONOMIC INDICATORS FOR COLOMBIA
// =============================================================================

export const colombiaEconomicIndicators: EconomicIndicator[] = [
  {
    name: "PIB per cápita",
    value: "USD 6,600",
    year: 2024,
    comparison: "Chile: USD 17,200 | OCDE: USD 46,000+",
    source: "Banco Mundial",
    sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=CO",
  },
  {
    name: "Crecimiento del PIB",
    value: "1.6% (2023)",
    year: 2023,
    comparison: "Promedio histórico 2010-2019: ~3.5% anual. Desaceleración significativa en 2023.",
    source: "Banco Mundial / DANE",
    sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=CO",
  },
  {
    name: "Informalidad laboral",
    value: "58% del empleo total",
    year: 2023,
    comparison: "Chile: ~27% | OCDE: ~15% | Perú: ~72%. Mejor que Perú pero lejos de Chile.",
    source: "DANE",
    sourceUrl: "https://www.dane.gov.co/index.php/estadisticas-por-tema/mercado-laboral/empleo-informal-y-seguridad-social",
  },
  {
    name: "Recaudación tributaria (% del PIB)",
    value: "~19.4%",
    year: 2023,
    comparison: "Promedio LAC: 21.3% | OCDE: 33.8%. Por encima de Perú (17%) pero por debajo del promedio regional.",
    source: "OECD Revenue Statistics LAC 2025",
    sourceUrl: "https://www.oecd.org/en/publications/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025_2922daa3.html",
  },
  {
    name: "Pobreza monetaria",
    value: "33.3%",
    year: 2023,
    comparison: "Pre-pandemia (2019): ~35.7%. Ligera mejora pero aún niveles altos. Chile: ~10.8%.",
    source: "DANE",
    sourceUrl: "https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-monetaria",
  },
  {
    name: "Coeficiente de Gini",
    value: "51.5",
    year: 2023,
    comparison: "Perú: 40.1 | Chile: 44.9 | OCDE promedio: ~32. Colombia es uno de los países más desiguales de LAC.",
    source: "Banco Mundial / DANE",
    sourceUrl: "https://data.worldbank.org/indicator/SI.POV.GINI?locations=CO",
  },
  {
    name: "Dependencia petrolera (% de exportaciones)",
    value: "~30% de exportaciones",
    year: 2024,
    comparison: "Petróleo y carbón dominan exportaciones. Vulnerable a volatilidad de precios de commodities.",
    source: "DANE / Banco de la República",
    sourceUrl: "https://www.dane.gov.co/index.php/estadisticas-por-tema/comercio-internacional/exportaciones",
  },
  {
    name: "Penetración de internet",
    value: "73% de la población",
    year: 2024,
    comparison: "Chile: ~90% | Brecha rural significativa, especialmente en departamentos del Pacífico y Amazonia.",
    source: "MinTIC / DataReportal Digital 2024",
    sourceUrl: "https://datareportal.com/reports/digital-2024-colombia",
  },
  {
    name: "Cobertura de salud",
    value: "~97% afiliados al SGSSS",
    year: 2023,
    comparison: "Alta cobertura en papel, pero crisis de las EPS, deudas millonarias y problemas de calidad y oportunidad en la atención.",
    source: "MinSalud / ADRES",
    sourceUrl: "https://www.minsalud.gov.co/",
  },
];

// =============================================================================
// THE 10 DEVELOPMENT PILLARS — COLOMBIA
// =============================================================================

export const colombiaPillars: DevelopmentPillar[] = [
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
      "Que las leyes se cumplan, que los jueces sean independientes y que el Estado llegue a todo el territorio — no solo a Bogotá.",
    whyItMatters:
      "Sin instituciones que funcionen, nada más funciona. Colombia tiene una Constitución moderna (1991) y organismos de control como la Fiscalía, la Procuraduría y la Contraloría, pero la presencia del Estado en muchas regiones sigue siendo débil. El conflicto armado durante más de 50 años erosionó la institucionalidad en vastas zonas del país. Los países que salieron adelante (Chile, Uruguay, Corea) lo hicieron fortaleciendo sus instituciones primero.",
    dataPoints: [
      "Colombia saca 39/100 en el Índice de Percepción de Corrupción — mejor que Perú (31) pero lejos de Chile (63)",
      "El conflicto armado de más de 50 años debilitó la presencia estatal en regiones enteras",
      "Colombia tiene una Constitución moderna (1991) pero su implementación sigue siendo desigual",
      "Los países con instituciones fuertes crecen más y tienen menos pobreza, según el Banco Mundial",
    ],
    peruStatus: {
      summary:
        "Colombia tiene un marco institucional más robusto que muchos vecinos gracias a la Constitución del 91, pero la presencia del Estado es muy desigual. En las ciudades principales las instituciones funcionan razonablemente; en zonas rurales y de conflicto, el Estado brilla por su ausencia.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Corruption Perceptions Index",
          organization: "Transparency International",
          year: 2024,
          rank: 91,
          totalCountries: 180,
          score: 39,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.transparency.org/en/cpi/2024/index/col",
          notes: "Mejor que Perú (31/100) pero lejos de Chile (63/100) y Uruguay (72/100).",
        },
        {
          indexName: "Rule of Law Index",
          organization: "World Justice Project",
          year: 2025,
          rank: 89,
          totalCountries: 143,
          score: null,
          maxScore: 1.0,
          trend: "estable",
          sourceUrl: "https://worldjusticeproject.org/rule-of-law-index/country/Colombia",
          notes: "Debilidades en justicia penal y orden y seguridad por el conflicto armado persistente.",
        },
      ],
      keyProblems: [
        "En muchas zonas rurales el Estado no existe — lo reemplazan grupos armados ilegales",
        "La corrupción permea todos los niveles de gobierno, especialmente el regional",
        "La implementación del Acuerdo de Paz avanza lentamente",
        "La confianza ciudadana en las instituciones es baja — menos del 20% confía en el Congreso",
      ],
    },
    benchmark: {
      country: "Uruguay",
      description:
        "Uruguay construyó instituciones sólidas con una Junta de Transparencia y Ética Pública efectiva, un sistema de partidos estable y un poder judicial independiente. Es el país mejor evaluado en gobernanza en América Latina.",
      keyMetric: "CPI: 72/100 (puesto 18 mundial) — líder regional",
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
      "Que robar al Estado tenga consecuencias reales. Que los políticos corruptos vayan presos, no a otro cargo público.",
    whyItMatters:
      "La corrupción es uno de los principales frenos al desarrollo de Colombia. Cada peso robado es un hospital que no se construye, una escuela sin techo, una vía sin pavimentar. Colombia saca 39/100 en el índice de corrupción — Chile saca 63 y Uruguay 72. Los escándalos de Odebrecht, las regalías mal invertidas y la corrupción en la contratación pública son la norma. Pero Uruguay demostró que en América Latina sí se puede tener instituciones limpias.",
    dataPoints: [
      "Colombia saca 39/100 en corrupción — Chile saca 63 y Uruguay 72",
      "El caso Odebrecht reveló corrupción sistemática en la contratación de infraestructura",
      "Se estima que la corrupción le cuesta a Colombia entre 4-5% del PIB anual",
      "Uruguay demostró que en América Latina se puede combatir la corrupción efectivamente",
    ],
    peruStatus: {
      summary:
        "Colombia tiene un problema serio de corrupción, especialmente en la contratación pública y los gobiernos regionales. Los organismos de control (Fiscalía, Procuraduría, Contraloría) existen pero su efectividad es limitada. Los procesos son lentos y la impunidad alta.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Corruption Perceptions Index",
          organization: "Transparency International",
          year: 2024,
          rank: 91,
          totalCountries: 180,
          score: 39,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.transparency.org/en/cpi/2024/index/col",
          notes: "Estancamiento en niveles medios-bajos. Uruguay lidera la región con 72/100.",
        },
      ],
      keyProblems: [
        "39/100 en corrupción — estancados hace años sin mejora significativa",
        "Odebrecht reveló corrupción en todos los niveles de contratación pública",
        "Los gobiernos regionales son focos de corrupción con poca supervisión efectiva",
        "Los procesos judiciales por corrupción duran años y la impunidad es alta",
      ],
    },
    benchmark: {
      country: "Uruguay",
      description:
        "Uruguay implementó la JUTEP (Junta de Transparencia y Ética Pública), mantiene un sistema de partidos con rendición de cuentas, y su cultura política penaliza la corrupción. Es el país más transparente de América Latina de manera consistente.",
      keyMetric: "CPI: 72/100 — líder indiscutible de transparencia en América Latina",
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
      "Que un joven que sale del colegio sepa leer bien, resolver problemas y conseguir trabajo. Hoy la mayoría no puede.",
    whyItMatters:
      "Sin educación no hay futuro. En las pruebas PISA, los estudiantes colombianos sacan 383 en matemáticas — el promedio OCDE es 472. Eso significa que la mayoría de jóvenes colombianos no puede resolver un problema matemático básico. La brecha entre colegios privados de elite y públicos rurales es enorme. Corea del Sur estaba peor que Colombia hace 60 años y hoy es potencia tecnológica — invirtieron en educación durante 30 años seguidos.",
    dataPoints: [
      "Colombia saca 383 en matemáticas PISA — el promedio OCDE es 472 (89 puntos abajo)",
      "En lectura: 411 puntos, 65 por debajo del promedio OCDE",
      "La brecha entre colegios privados de Bogotá y escuelas rurales del Chocó es abismal",
      "Corea del Sur invirtió 5% del PIB en educación por 30 años y pasó de pobre a potencia",
    ],
    peruStatus: {
      summary:
        "Los jóvenes colombianos salen del colegio con herramientas insuficientes. Estamos muy por debajo de la OCDE en todas las materias. Colombia ha hecho esfuerzos (Ser Pilo Paga, Generación E) pero los resultados aún son pobres.",
      score: "deficiente",
      rankings: [
        {
          indexName: "PISA 2022 (Matemáticas)",
          organization: "OECD",
          year: 2022,
          rank: null,
          totalCountries: 81,
          score: 383,
          maxScore: 600,
          trend: "estable",
          sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/colombia_ed6fbcc5-en.html",
          notes: "89 puntos por debajo del promedio OCDE. Chile: 412 puntos.",
        },
        {
          indexName: "PISA 2022 (Lectura)",
          organization: "OECD",
          year: 2022,
          rank: null,
          totalCountries: 81,
          score: 411,
          maxScore: 600,
          trend: "estable",
          sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/colombia_ed6fbcc5-en.html",
          notes: "65 puntos por debajo del promedio OCDE. Mejor que Perú (408) pero lejos de Chile (448).",
        },
      ],
      keyProblems: [
        "La mayoría de estudiantes no alcanza el nivel mínimo de competencia en matemáticas",
        "Estamos 89 puntos abajo del promedio OCDE en PISA matemáticas",
        "Un joven de un colegio privado de Bogotá aprende el doble que uno rural del Chocó",
        "La formación docente es débil y los salarios de maestros no son competitivos",
      ],
    },
    benchmark: {
      country: "Corea del Sur",
      description:
        "Corea del Sur invirtió consistentemente 4-5% de su PIB en educación durante 30+ años, creó planes educativos alineados con su desarrollo económico, y usó tecnología educativa desde etapas tempranas. PISA 2022: Matemáticas 527, Lectura 515.",
      keyMetric: "PISA Matemáticas: 527 puntos (Colombia: 383)",
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
      "Que llegue agua limpia a todos, que las carreteras conecten el país, y que internet no sea un lujo de las grandes ciudades.",
    whyItMatters:
      "Colombia tiene una geografía retadora — tres cordilleras, selva, llanos. Pero eso no justifica que las vías 4G lleven años de retraso, que en el Chocó no haya agua potable, o que en la Amazonia y el Pacífico el internet sea un sueño. Las concesiones viales de cuarta generación (4G) prometieron transformar el país pero los sobrecostos y retrasos son la constante. Mientras tanto, Chile tiene la mejor logística de América Latina.",
    dataPoints: [
      "Las concesiones viales 4G llevan años de retraso y sobrecostos millonarios",
      "En el Chocó y el Pacífico, muchas comunidades no tienen agua potable",
      "Solo 73% de colombianos tiene acceso a internet — en zonas rurales es mucho menos",
      "Chile tiene la mejor logística de transporte de América Latina — Colombia está atrasada",
    ],
    peruStatus: {
      summary:
        "La geografía dificulta las cosas, pero la corrupción y la ineficiencia las empeoran. Las vías 4G van con años de retraso. El Pacífico y la Amazonia están desconectados. En las ciudades principales la infraestructura funciona; fuera de ellas, es otra Colombia.",
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
          notes: "Infraestructura es una de las áreas débiles de Colombia en el GCI. Score general 62.7/100.",
        },
      ],
      keyProblems: [
        "Las concesiones viales 4G llevan años de retraso y sobrecostos enormes",
        "El Pacífico colombiano (Chocó, Buenaventura) carece de infraestructura básica",
        "La brecha digital rural es enorme — en zonas apartadas no hay conectividad",
        "Los proyectos de infraestructura son blanco constante de corrupción",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile invirtió en infraestructura de transporte y concesiones público-privadas de manera consistente. Tiene la mejor infraestructura logística de América Latina según el LPI del Banco Mundial.",
      keyMetric: "LPI Chile entre los mejores de América Latina",
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
      "Que puedas hacer trámites desde tu celular sin hacer fila. Que el Estado use tecnología en vez de papel y ventanillas.",
    whyItMatters:
      "En Estonia, el 100% de trámites del gobierno se hacen online — no hay filas, no hay mordidas, no hay papeles. Colombia ha avanzado con GOV.CO y la ventanilla única, pero todavía hay demasiados trámites presenciales. La digitalización reduce corrupción (todo queda registrado), ahorra plata al Estado y facilita la vida de la gente. Colombia está entre los líderes digitales de LAC pero aún lejos de los referentes mundiales.",
    dataPoints: [
      "Colombia lanzó GOV.CO como portal único del Estado — avance importante pero incompleto",
      "73% de colombianos tiene internet, pero en zonas rurales la cifra cae drásticamente",
      "Colombia está entre los líderes digitales de LAC junto con Chile y Brasil",
      "Estonia pasó de país pobre post-soviético a tener el 7% de su economía en tecnología",
    ],
    peruStatus: {
      summary:
        "Colombia ha avanzado en gobierno digital con GOV.CO y el MinTIC, pero la implementación es desigual. En Bogotá y Medellín los servicios digitales funcionan; en municipios rurales, el papel sigue mandando. La brecha digital entre ciudades principales y el campo es enorme.",
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
          sourceUrl: "https://networkreadinessindex.org/",
          notes: "Colombia entre los líderes de desarrollo digital en América Latina. Fortalezas en gobierno electrónico pero debilidades en conectividad rural.",
        },
      ],
      keyProblems: [
        "En zonas rurales la conectividad es mínima — la brecha digital es enorme",
        "Muchos municipios pequeños no tienen capacidad técnica para servicios digitales",
        "GOV.CO es un avance pero muchos trámites aún requieren ir presencialmente",
        "La ciberseguridad es una debilidad creciente en las entidades públicas",
      ],
    },
    benchmark: {
      country: "Estonia",
      description:
        "Estonia digitalizó el 100% de sus servicios gubernamentales, creó identidad digital para el 99% de la población, e implementó X-Road para intercambio seguro de datos. Su PIB per cápita pasó de USD 3,435 a USD 32,460 entre 1991 y 2023.",
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
    name: "No Solo Petróleo",
    nameEn: "Economic Diversification & Productivity",
    icon: "TrendingUp",
    color: "orange",
    shortDescription:
      "Colombia depende demasiado del petróleo y la minería. Si baja el precio del crudo, la economía sufre. Necesitamos más industrias y formalizar empleos.",
    whyItMatters:
      "Cerca del 30% de lo que Colombia exporta es petróleo y carbón. Si mañana baja el precio del crudo, se nos cae la balanza comercial. Además, casi 6 de cada 10 colombianos trabajan en la informalidad — sin seguro, sin pensión, sin derechos. Chile diversificó hacia servicios, agroindustria y tecnología. Colombia ha avanzado en agroindustria y servicios pero la dependencia de commodities sigue siendo alta.",
    dataPoints: [
      "~30% de las exportaciones colombianas son petróleo y carbón — alta dependencia de commodities",
      "Casi 6 de cada 10 colombianos trabajan sin contrato formal, sin seguro, sin pensión",
      "El crecimiento se frenó: de ~3.5% promedio histórico a 1.6% en 2023",
      "Chile diversificó su economía y su PIB per cápita es casi tres veces el de Colombia",
    ],
    peruStatus: {
      summary:
        "Colombia depende mucho del petróleo y la minería para sus exportaciones. La informalidad es alta (58%) y el crecimiento se desaceleró. Ha habido avances en agroindustria, turismo y servicios, pero la diversificación es insuficiente.",
      score: "deficiente",
      rankings: [
        {
          indexName: "IMD World Competitiveness Ranking",
          organization: "IMD Business School",
          year: 2024,
          rank: 57,
          totalCountries: 67,
          score: null,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/",
          notes: "Tercero en LAC después de Chile (44) y México (56). Mejor que Brasil (62) y Perú (63).",
        },
        {
          indexName: "Global Competitiveness Index 4.0",
          organization: "World Economic Forum",
          year: 2019,
          rank: 57,
          totalCountries: 141,
          score: 62.7,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.weforum.org/publications/global-competitiveness-report-2019/",
          notes: "Pilares de Innovación y Dinamismo Empresarial entre los más débiles.",
        },
      ],
      keyProblems: [
        "~30% de las exportaciones son petróleo y carbón — si baja el crudo, sufrimos",
        "58% de los colombianos trabajan informal — sin contrato, sin seguro, sin futuro",
        "El crecimiento económico se frenó a 1.6% en 2023 — lejos del promedio histórico",
        "Chile gana casi tres veces más que Colombia per cápita",
        "La productividad laboral es baja comparada con países OCDE",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile diversificó más allá de la minería hacia servicios financieros, agroindustria, energía renovable y tecnología. Mantuvo apertura comercial con múltiples TLCs y reformas pro-empresa.",
      keyMetric: "PIB per cápita Chile: USD 17,200 vs Colombia: USD 6,600",
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
      "El 97% está afiliado al sistema de salud, pero las EPS están en crisis, las filas son eternas y la atención llega tarde. Eso no es salud.",
    whyItMatters:
      "Colombia tiene un sistema de salud con cobertura casi universal en el papel — la Ley 100 de 1993 fue revolucionaria. Pero el sistema de EPS está en crisis: deudas billonarias, demoras en autorizaciones, pacientes que se mueren esperando una cita. En regiones como Chocó, Guainía o Vaupés, la atención médica es prácticamente inexistente. La esperanza de vida es 73.7 años — un chileno vive 79, más de 5 años más.",
    dataPoints: [
      "97% de colombianos están afiliados al SGSSS — alta cobertura en papel",
      "Las EPS acumulan deudas billonarias y varias han sido liquidadas",
      "En el Chocó y la Amazonia, la atención médica es casi inexistente",
      "Esperanza de vida: 73.7 años — un chileno vive 79, más de 5 años más",
    ],
    peruStatus: {
      summary:
        "Colombia tiene alta cobertura de afiliación pero el sistema de EPS está en crisis profunda. Deudas billonarias, demoras en autorizaciones, y desigualdad enorme entre las ciudades principales y las regiones apartadas. La Ley 100 fue visionaria pero su implementación falló.",
      score: "en_progreso",
      rankings: [
        {
          indexName: "Human Development Index (componente salud)",
          organization: "PNUD",
          year: 2022,
          rank: 88,
          totalCountries: 193,
          score: 0.758,
          maxScore: 1.0,
          trend: "estable",
          sourceUrl: "https://hdr.undp.org/data-center/human-development-index",
          notes: "Esperanza de vida: 73.7 años. Chile: 78.9 años. Costa Rica: 80.3 años.",
        },
      ],
      keyProblems: [
        "Las EPS acumulan deudas billonarias y el sistema financiero del SGSSS está al borde del colapso",
        "Las autorizaciones médicas tardan semanas — pacientes esperando cirugía o tratamientos críticos",
        "En regiones como Chocó, Guainía y Vaupés, la infraestructura de salud es mínima",
        "La tutela se convirtió en la vía principal para acceder a servicios de salud — eso no es normal",
        "Mortalidad materna e infantil sigue siendo alta en zonas rurales y comunidades étnicas",
      ],
    },
    benchmark: {
      country: "Costa Rica",
      description:
        "Costa Rica abolió su ejército en 1948 y redirigió esos recursos a salud y educación. Su sistema de salud (CCSS) logra cobertura universal efectiva con esperanza de vida de 80.3 años, comparable a países desarrollados.",
      keyMetric: "Esperanza de vida Costa Rica: 80.3 años vs Colombia: 73.7 años",
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
      "Colombia es uno de los países más desiguales de América Latina. Un joven en Bogotá tiene oportunidades radicalmente distintas a uno en Chocó o Guaviare.",
    whyItMatters:
      "Con un Gini de 51.5, Colombia es uno de los países más desiguales del mundo. Un tercio de los colombianos vive en pobreza y las brechas territoriales son inmensas. Si naciste en el Chocó, tu esperanza de vida es años menor que si naciste en Bogotá. El conflicto armado desplazó a más de 8 millones de personas, creando una crisis humanitaria que aún no se resuelve. La pandemia agravó todo — la pobreza saltó varios puntos de un año a otro.",
    dataPoints: [
      "Gini de 51.5 — uno de los países más desiguales de América Latina y del mundo",
      "33.3% de colombianos son pobres según el DANE",
      "Más de 8 millones de desplazados internos por el conflicto armado",
      "La brecha entre Bogotá y departamentos como Chocó, La Guajira o Vaupés es abismal",
    ],
    peruStatus: {
      summary:
        "Colombia es uno de los países más desiguales del mundo. La pobreza afecta a un tercio de la población y la desigualdad territorial es extrema. El conflicto armado generó más de 8 millones de desplazados cuya situación sigue sin resolverse plenamente. Los programas sociales (Familias en Acción, Ingreso Solidario) ayudan pero no resuelven el problema estructural.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Human Development Index",
          organization: "PNUD",
          year: 2022,
          rank: 88,
          totalCountries: 193,
          score: 0.758,
          maxScore: 1.0,
          trend: "estable",
          sourceUrl: "https://hdr.undp.org/data-center/human-development-index",
          notes: "Desarrollo humano 'alto' pero con enorme desigualdad interna. Chile: 0.860 (puesto 44).",
        },
      ],
      keyProblems: [
        "Gini de 51.5 — desigualdad de las más altas del mundo",
        "33.3% vive en pobreza — y en regiones como La Guajira supera el 60%",
        "Más de 8 millones de desplazados internos — la mayor crisis de desplazamiento de LAC",
        "Si naces en el Chocó, tus oportunidades son radicalmente menores que si naces en Bogotá",
        "Las comunidades indígenas y afrocolombianas sufren marginalidad sistemática",
      ],
    },
    benchmark: {
      country: "Uruguay",
      description:
        "Uruguay implementó políticas sociales universales con amplia cobertura, un sistema de seguridad social robusto y políticas de inclusión efectivas. Tiene el Gini más bajo de América Latina (~39) y los menores niveles de pobreza de la región.",
      keyMetric: "Gini Uruguay: ~39 vs Colombia: 51.5",
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
    name: "El Estado Necesita Más Recursos",
    nameEn: "Fiscal Capacity & Public Management",
    icon: "Wallet",
    color: "cyan",
    shortDescription:
      "Colombia recauda más que Perú pero menos que el promedio regional. La informalidad, la evasión y la dependencia del petróleo limitan los ingresos del Estado.",
    whyItMatters:
      "El Estado colombiano recauda 19.4% del PIB en impuestos — mejor que Perú (17%) pero por debajo del promedio LAC (21.3%) y lejos de la OCDE (33.8%). Sin plata suficiente no puedes construir hospitales, pagar buenos profesores ni hacer vías. La informalidad (58% del empleo) y la evasión tributaria reducen la base fiscal. La dependencia de los ingresos petroleros hace que cuando baja el crudo, al Estado se le acaba la plata.",
    dataPoints: [
      "Colombia recauda 19.4% del PIB — por debajo del promedio LAC (21.3%) y lejos de la OCDE (33.8%)",
      "La reforma tributaria de 2022 buscó aumentar la recaudación pero los resultados son mixtos",
      "58% del empleo es informal — no genera impuestos directos",
      "La dependencia de ingresos petroleros hace frágil la posición fiscal",
    ],
    peruStatus: {
      summary:
        "Colombia recauda más que Perú pero todavía insuficiente para las necesidades del país. La evasión tributaria es alta, la informalidad limita la base fiscal, y la dependencia del petróleo hace los ingresos volátiles. La reforma tributaria de 2022 fue un esfuerzo pero no resuelve el problema estructural.",
      score: "en_progreso",
      rankings: [
        {
          indexName: "Tax-to-GDP Ratio",
          organization: "OECD Revenue Statistics LAC",
          year: 2023,
          rank: null,
          totalCountries: 26,
          score: 19.4,
          maxScore: 100,
          trend: "estable",
          sourceUrl: "https://www.oecd.org/en/publications/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025_2922daa3.html",
          notes: "Por encima de Perú (17%) pero debajo del promedio LAC (21.3%). OCDE promedio: 33.8%.",
        },
      ],
      keyProblems: [
        "Recaudamos menos que el promedio regional — 19.4% vs 21.3% de LAC",
        "La evasión tributaria es estimada en varios puntos del PIB",
        "58% del empleo es informal — no genera ingresos fiscales directos",
        "Los ingresos petroleros son volátiles y representan una porción importante del presupuesto",
        "El gasto público es ineficiente — los recursos no llegan donde más se necesitan",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene una recaudación tributaria alrededor del 21% del PIB, con reformas tributarias progresivas, una administración fiscal más eficiente (SII) y menor informalidad (~27% del empleo).",
      keyMetric: "Chile: ~21% del PIB en impuestos vs Colombia: ~19.4%",
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
      "Que puedas caminar tranquilo por la calle. Que el conflicto armado sea realmente cosa del pasado. Que la justicia funcione para todos.",
    whyItMatters:
      "Colombia ha vivido más de 50 años de conflicto armado que dejó más de 9 millones de víctimas. El Acuerdo de Paz de 2016 fue histórico pero su implementación es lenta e incompleta. Hoy persisten grupos armados (ELN, disidencias de FARC, bandas criminales), el narcotráfico sigue siendo un motor de violencia, y la tasa de homicidios aunque ha bajado significativamente, sigue siendo alta. En las ciudades, la inseguridad urbana es la preocupación principal. Colombia está en el puesto 89 de 143 en estado de derecho.",
    dataPoints: [
      "Colombia está en el puesto 89 de 143 países en estado de derecho",
      "Más de 9 millones de víctimas del conflicto armado registradas",
      "La implementación del Acuerdo de Paz avanza pero con retrasos significativos",
      "El narcotráfico sigue siendo un motor principal de violencia en el país",
    ],
    peruStatus: {
      summary:
        "Colombia ha logrado avances históricos con el Acuerdo de Paz de 2016 pero la violencia persiste. Grupos armados ilegales, narcotráfico y criminalidad organizada afectan especialmente las zonas rurales. La justicia es lenta y la impunidad alta. La JEP (Justicia Especial para la Paz) es innovadora pero enfrenta resistencias.",
      score: "deficiente",
      rankings: [
        {
          indexName: "Rule of Law Index",
          organization: "World Justice Project",
          year: 2025,
          rank: 89,
          totalCountries: 143,
          score: null,
          maxScore: 1.0,
          trend: "estable",
          sourceUrl: "https://worldjusticeproject.org/rule-of-law-index/country/Colombia",
          notes: "Debilidades en justicia penal, orden y seguridad. La JEP es un mecanismo innovador pero su efectividad aún se evalúa.",
        },
      ],
      keyProblems: [
        "Persisten grupos armados ilegales (ELN, disidencias FARC, bandas criminales)",
        "El narcotráfico sigue siendo motor de violencia — Colombia es primer productor mundial de coca",
        "La tasa de homicidios ha bajado pero sigue siendo alta para estándares internacionales",
        "La justicia es lenta — los procesos duran años y la impunidad supera el 90%",
        "Los líderes sociales y excombatientes son asesinados sistemáticamente",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene un sistema judicial más independiente y eficiente, con reformas procesales penales exitosas. Se ubica en el puesto 27 del WJP Rule of Law Index, entre los mejores de América Latina junto con Uruguay y Costa Rica.",
      keyMetric: "Chile: puesto 27/143 en Rule of Law Index vs Colombia: 89/143",
    },
    frameworks: ["wjp-roli", "wb-wgi", "wef-gci"],
    relatedPillars: ["institucionalidad", "anticorrupcion"],
  },
];
