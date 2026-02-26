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
    region: "America Latina",
    relevance:
      "Vecino exitoso con contexto regional similar. Lider en desarrollo humano (IDH #44), control de corrupcion (CPI: 63/100) y competitividad en LAC. Demuestra que el progreso institucional es posible en la region.",
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
    country: "Uruguay",
    region: "America Latina",
    relevance:
      "Mejor gobernanza de America Latina. Lidera la region en transparencia (CPI: 72/100), democracia y estado de derecho. Modelo de institucionalidad solida en un pais pequeno.",
    keyReforms: [
      "Fortalecimiento de la Junta de Transparencia y Etica Publica (JUTEP)",
      "Sistema de partidos estable y democratico",
      "Inversion sostenida en educacion publica",
      "Politicas sociales universales con amplia cobertura",
      "Regulacion innovadora (cannabis, energias renovables)",
    ],
    gdpPerCapita: 22800,
    yearsOfTransformation: "2000-2020",
  },
  {
    country: "Costa Rica",
    region: "Centroamerica",
    relevance:
      "Modelo centroamericano de inversion en educacion y salud. Abolio el ejercito en 1948 y redirigio esos recursos a desarrollo social. Esperanza de vida comparable a paises desarrollados.",
    keyReforms: [
      "Abolicion del ejercito y redireccion de recursos a educacion y salud (1948)",
      "Cobertura de salud universal a traves de la CCSS",
      "Inversion sostenida en educacion (~7% del PIB)",
      "Proteccion ambiental como politica de Estado",
      "Atraccion de inversion extranjera en alta tecnologia",
    ],
    gdpPerCapita: 13200,
    yearsOfTransformation: "1948-2000",
  },
  {
    country: "Corea del Sur",
    region: "Asia Oriental",
    relevance:
      "Modelo de transformacion educativa y tecnologica. Paso de pais pobre a economia avanzada en 30 anos, impulsado por inversion masiva en educacion, ciencia y tecnologia.",
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
      "Lider mundial en gobierno digital y digitalizacion. 100% de servicios gubernamentales en linea. Transformacion post-sovietica exitosa con enfoque en tecnologia e innovacion.",
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
    notes: "Ultima edicion publicada. Colombia se ubica en la mitad del ranking global, cuarto en LAC despues de Chile (33), Mexico (48) y Uruguay (54).",
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
    notes: "Por encima de Peru (31/100, puesto 127) pero muy lejos de Chile (63/100, puesto 31) y Uruguay (72/100, puesto 18).",
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
    notes: "Categoria 'desarrollo humano alto'. Chile lidera la region con 0.860 (puesto 44). Colombia esta ligeramente por debajo del promedio LAC.",
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
    notes: "Colombia se ubica en el puesto 89 de 143 paises. Debilidades en justicia penal, orden y seguridad por el conflicto armado.",
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
    notes: "Ultima edicion publicada (indice descontinuado en 2021). Colombia se ubicaba entre los mejores de LAC, con fortalezas en proteccion a inversionistas.",
  },
  {
    indexName: "PISA 2022 (Matematicas)",
    organization: "OECD",
    year: 2022,
    rank: null,
    totalCountries: 81,
    score: 383,
    maxScore: 600,
    trend: "estable",
    sourceUrl: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/colombia_ed6fbcc5-en.html",
    notes: "Promedio OCDE: 472 puntos. Chile lidera la region con 412 puntos. Solo ~35% de estudiantes colombianos alcanzan nivel 2 de competencia (vs 69% OCDE).",
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
    notes: "Promedio OCDE: 476 puntos. Colombia esta 65 puntos por debajo del promedio OCDE. Mejor que Peru (408) pero lejos de Chile (448).",
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
    notes: "Tercero en America Latina despues de Chile (44) y Mexico (56). Mejor que Brasil (62) y Peru (63).",
  },
];

// =============================================================================
// KEY ECONOMIC INDICATORS FOR COLOMBIA
// =============================================================================

export const colombiaEconomicIndicators: EconomicIndicator[] = [
  {
    name: "PIB per capita",
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
    comparison: "Promedio historico 2010-2019: ~3.5% anual. Desaceleracion significativa en 2023.",
    source: "Banco Mundial / DANE",
    sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=CO",
  },
  {
    name: "Informalidad laboral",
    value: "58% del empleo total",
    year: 2023,
    comparison: "Chile: ~27% | OCDE: ~15% | Peru: ~72%. Mejor que Peru pero lejos de Chile.",
    source: "DANE",
    sourceUrl: "https://www.dane.gov.co/index.php/estadisticas-por-tema/mercado-laboral/empleo-informal-y-seguridad-social",
  },
  {
    name: "Recaudacion tributaria (% del PIB)",
    value: "~19.4%",
    year: 2023,
    comparison: "Promedio LAC: 21.3% | OCDE: 33.8%. Por encima de Peru (17%) pero por debajo del promedio regional.",
    source: "OECD Revenue Statistics LAC 2025",
    sourceUrl: "https://www.oecd.org/en/publications/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025_2922daa3.html",
  },
  {
    name: "Pobreza monetaria",
    value: "33.3%",
    year: 2023,
    comparison: "Pre-pandemia (2019): ~35.7%. Ligera mejora pero aun niveles altos. Chile: ~10.8%.",
    source: "DANE",
    sourceUrl: "https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-monetaria",
  },
  {
    name: "Coeficiente de Gini",
    value: "51.5",
    year: 2023,
    comparison: "Peru: 40.1 | Chile: 44.9 | OCDE promedio: ~32. Colombia es uno de los paises mas desiguales de LAC.",
    source: "Banco Mundial / DANE",
    sourceUrl: "https://data.worldbank.org/indicator/SI.POV.GINI?locations=CO",
  },
  {
    name: "Dependencia petrolera (% de exportaciones)",
    value: "~30% de exportaciones",
    year: 2024,
    comparison: "Petroleo y carbon dominan exportaciones. Vulnerable a volatilidad de precios de commodities.",
    source: "DANE / Banco de la Republica",
    sourceUrl: "https://www.dane.gov.co/index.php/estadisticas-por-tema/comercio-internacional/exportaciones",
  },
  {
    name: "Penetracion de internet",
    value: "73% de la poblacion",
    year: 2024,
    comparison: "Chile: ~90% | Brecha rural significativa, especialmente en departamentos del Pacifico y Amazonia.",
    source: "MinTIC / DataReportal Digital 2024",
    sourceUrl: "https://datareportal.com/reports/digital-2024-colombia",
  },
  {
    name: "Cobertura de salud",
    value: "~97% afiliados al SGSSS",
    year: 2023,
    comparison: "Alta cobertura en papel, pero crisis de las EPS, deudas millonarias y problemas de calidad y oportunidad en la atencion.",
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
      "Que las leyes se cumplan, que los jueces sean independientes y que el Estado llegue a todo el territorio — no solo a Bogota.",
    whyItMatters:
      "Sin instituciones que funcionen, nada mas funciona. Colombia tiene una Constitucion moderna (1991) y organismos de control como la Fiscalia, la Procuraduria y la Contraloria, pero la presencia del Estado en muchas regiones sigue siendo debil. El conflicto armado durante mas de 50 anos erosiono la institucionalidad en vastas zonas del pais. Los paises que salieron adelante (Chile, Uruguay, Corea) lo hicieron fortaleciendo sus instituciones primero.",
    dataPoints: [
      "Colombia saca 39/100 en el Indice de Percepcion de Corrupcion — mejor que Peru (31) pero lejos de Chile (63)",
      "El conflicto armado de mas de 50 anos debilito la presencia estatal en regiones enteras",
      "Colombia tiene una Constitucion moderna (1991) pero su implementacion sigue siendo desigual",
      "Los paises con instituciones fuertes crecen mas y tienen menos pobreza, segun el Banco Mundial",
    ],
    peruStatus: {
      summary:
        "Colombia tiene un marco institucional mas robusto que muchos vecinos gracias a la Constitucion del 91, pero la presencia del Estado es muy desigual. En las ciudades principales las instituciones funcionan razonablemente; en zonas rurales y de conflicto, el Estado brilla por su ausencia.",
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
          notes: "Mejor que Peru (31/100) pero lejos de Chile (63/100) y Uruguay (72/100).",
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
        "La corrupcion permea todos los niveles de gobierno, especialmente el regional",
        "La implementacion del Acuerdo de Paz avanza lentamente",
        "La confianza ciudadana en las instituciones es baja — menos del 20% confia en el Congreso",
      ],
    },
    benchmark: {
      country: "Uruguay",
      description:
        "Uruguay construyo instituciones solidas con una Junta de Transparencia y Etica Publica efectiva, un sistema de partidos estable y un poder judicial independiente. Es el pais mejor evaluado en gobernanza en America Latina.",
      keyMetric: "CPI: 72/100 (puesto 18 mundial) — lider regional",
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
      "Que robar al Estado tenga consecuencias reales. Que los politicos corruptos vayan presos, no a otro cargo publico.",
    whyItMatters:
      "La corrupcion es uno de los principales frenos al desarrollo de Colombia. Cada peso robado es un hospital que no se construye, una escuela sin techo, una via sin pavimentar. Colombia saca 39/100 en el indice de corrupcion — Chile saca 63 y Uruguay 72. Los escandalos de Odebrecht, las regalias mal invertidas y la corrupcion en la contratacion publica son la norma. Pero Uruguay demostro que en America Latina si se puede tener instituciones limpias.",
    dataPoints: [
      "Colombia saca 39/100 en corrupcion — Chile saca 63 y Uruguay 72",
      "El caso Odebrecht revelo corrupcion sistematica en la contratacion de infraestructura",
      "Se estima que la corrupcion le cuesta a Colombia entre 4-5% del PIB anual",
      "Uruguay demostro que en America Latina se puede combatir la corrupcion efectivamente",
    ],
    peruStatus: {
      summary:
        "Colombia tiene un problema serio de corrupcion, especialmente en la contratacion publica y los gobiernos regionales. Los organismos de control (Fiscalia, Procuraduria, Contraloria) existen pero su efectividad es limitada. Los procesos son lentos y la impunidad alta.",
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
          notes: "Estancamiento en niveles medios-bajos. Uruguay lidera la region con 72/100.",
        },
      ],
      keyProblems: [
        "39/100 en corrupcion — estancados hace anos sin mejora significativa",
        "Odebrecht revelo corrupcion en todos los niveles de contratacion publica",
        "Los gobiernos regionales son focos de corrupcion con poca supervision efectiva",
        "Los procesos judiciales por corrupcion duran anos y la impunidad es alta",
      ],
    },
    benchmark: {
      country: "Uruguay",
      description:
        "Uruguay implemento la JUTEP (Junta de Transparencia y Etica Publica), mantiene un sistema de partidos con rendicion de cuentas, y su cultura politica penaliza la corrupcion. Es el pais mas transparente de America Latina de manera consistente.",
      keyMetric: "CPI: 72/100 — lider indiscutible de transparencia en America Latina",
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
      "Que un joven que sale del colegio sepa leer bien, resolver problemas y conseguir trabajo. Hoy la mayoria no puede.",
    whyItMatters:
      "Sin educacion no hay futuro. En las pruebas PISA, los estudiantes colombianos sacan 383 en matematicas — el promedio OCDE es 472. Eso significa que la mayoria de jovenes colombianos no puede resolver un problema matematico basico. La brecha entre colegios privados de elite y publicos rurales es enorme. Corea del Sur estaba peor que Colombia hace 60 anos y hoy es potencia tecnologica — invirtieron en educacion durante 30 anos seguidos.",
    dataPoints: [
      "Colombia saca 383 en matematicas PISA — el promedio OCDE es 472 (89 puntos abajo)",
      "En lectura: 411 puntos, 65 por debajo del promedio OCDE",
      "La brecha entre colegios privados de Bogota y escuelas rurales del Choco es abismal",
      "Corea del Sur invirtio 5% del PIB en educacion por 30 anos y paso de pobre a potencia",
    ],
    peruStatus: {
      summary:
        "Los jovenes colombianos salen del colegio con herramientas insuficientes. Estamos muy por debajo de la OCDE en todas las materias. Colombia ha hecho esfuerzos (Ser Pilo Paga, Generacion E) pero los resultados aun son pobres.",
      score: "deficiente",
      rankings: [
        {
          indexName: "PISA 2022 (Matematicas)",
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
          notes: "65 puntos por debajo del promedio OCDE. Mejor que Peru (408) pero lejos de Chile (448).",
        },
      ],
      keyProblems: [
        "La mayoria de estudiantes no alcanza el nivel minimo de competencia en matematicas",
        "Estamos 89 puntos abajo del promedio OCDE en PISA matematicas",
        "Un joven de un colegio privado de Bogota aprende el doble que uno rural del Choco",
        "La formacion docente es debil y los salarios de maestros no son competitivos",
      ],
    },
    benchmark: {
      country: "Corea del Sur",
      description:
        "Corea del Sur invirtio consistentemente 4-5% de su PIB en educacion durante 30+ anos, creo planes educativos alineados con su desarrollo economico, y uso tecnologia educativa desde etapas tempranas. PISA 2022: Matematicas 527, Lectura 515.",
      keyMetric: "PISA Matematicas: 527 puntos (Colombia: 383)",
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
      "Que llegue agua limpia a todos, que las carreteras conecten el pais, y que internet no sea un lujo de las grandes ciudades.",
    whyItMatters:
      "Colombia tiene una geografia retadora — tres cordilleras, selva, llanos. Pero eso no justifica que las vias 4G lleven anos de retraso, que en el Choco no haya agua potable, o que en la Amazonia y el Pacifico el internet sea un sueno. Las concesiones viales de cuarta generacion (4G) prometieron transformar el pais pero los sobrecostos y retrasos son la constante. Mientras tanto, Chile tiene la mejor logistica de America Latina.",
    dataPoints: [
      "Las concesiones viales 4G llevan anos de retraso y sobrecostos millonarios",
      "En el Choco y el Pacifico, muchas comunidades no tienen agua potable",
      "Solo 73% de colombianos tiene acceso a internet — en zonas rurales es mucho menos",
      "Chile tiene la mejor logistica de transporte de America Latina — Colombia esta atrasada",
    ],
    peruStatus: {
      summary:
        "La geografia dificulta las cosas, pero la corrupcion y la ineficiencia las empeoran. Las vias 4G van con anos de retraso. El Pacifico y la Amazonia estan desconectados. En las ciudades principales la infraestructura funciona; fuera de ellas, es otra Colombia.",
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
          notes: "Infraestructura es una de las areas debiles de Colombia en el GCI. Score general 62.7/100.",
        },
      ],
      keyProblems: [
        "Las concesiones viales 4G llevan anos de retraso y sobrecostos enormes",
        "El Pacifico colombiano (Choco, Buenaventura) carece de infraestructura basica",
        "La brecha digital rural es enorme — en zonas apartadas no hay conectividad",
        "Los proyectos de infraestructura son blanco constante de corrupcion",
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
      "Que puedas hacer tramites desde tu celular sin hacer fila. Que el Estado use tecnologia en vez de papel y ventanillas.",
    whyItMatters:
      "En Estonia, el 100% de tramites del gobierno se hacen online — no hay filas, no hay mordidas, no hay papeles. Colombia ha avanzado con GOV.CO y la ventanilla unica, pero todavia hay demasiados tramites presenciales. La digitalizacion reduce corrupcion (todo queda registrado), ahorra plata al Estado y facilita la vida de la gente. Colombia esta entre los lideres digitales de LAC pero aun lejos de los referentes mundiales.",
    dataPoints: [
      "Colombia lanzo GOV.CO como portal unico del Estado — avance importante pero incompleto",
      "73% de colombianos tiene internet, pero en zonas rurales la cifra cae drasticamente",
      "Colombia esta entre los lideres digitales de LAC junto con Chile y Brasil",
      "Estonia paso de pais pobre post-sovietico a tener el 7% de su economia en tecnologia",
    ],
    peruStatus: {
      summary:
        "Colombia ha avanzado en gobierno digital con GOV.CO y el MinTIC, pero la implementacion es desigual. En Bogota y Medellin los servicios digitales funcionan; en municipios rurales, el papel sigue mandando. La brecha digital entre ciudades principales y el campo es enorme.",
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
          notes: "Colombia entre los lideres de desarrollo digital en America Latina. Fortalezas en gobierno electronico pero debilidades en conectividad rural.",
        },
      ],
      keyProblems: [
        "En zonas rurales la conectividad es minima — la brecha digital es enorme",
        "Muchos municipios pequenos no tienen capacidad tecnica para servicios digitales",
        "GOV.CO es un avance pero muchos tramites aun requieren ir presencialmente",
        "La ciberseguridad es una debilidad creciente en las entidades publicas",
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
    name: "No Solo Petroleo",
    nameEn: "Economic Diversification & Productivity",
    icon: "TrendingUp",
    color: "orange",
    shortDescription:
      "Colombia depende demasiado del petroleo y la mineria. Si baja el precio del crudo, la economia sufre. Necesitamos mas industrias y formalizar empleos.",
    whyItMatters:
      "Cerca del 30% de lo que Colombia exporta es petroleo y carbon. Si manana baja el precio del crudo, se nos cae la balanza comercial. Ademas, casi 6 de cada 10 colombianos trabajan en la informalidad — sin seguro, sin pension, sin derechos. Chile diversifico hacia servicios, agroindustria y tecnologia. Colombia ha avanzado en agroindustria y servicios pero la dependencia de commodities sigue siendo alta.",
    dataPoints: [
      "~30% de las exportaciones colombianas son petroleo y carbon — alta dependencia de commodities",
      "Casi 6 de cada 10 colombianos trabajan sin contrato formal, sin seguro, sin pension",
      "El crecimiento se freno: de ~3.5% promedio historico a 1.6% en 2023",
      "Chile diversifico su economia y su PIB per capita es casi tres veces el de Colombia",
    ],
    peruStatus: {
      summary:
        "Colombia depende mucho del petroleo y la mineria para sus exportaciones. La informalidad es alta (58%) y el crecimiento se desacelero. Ha habido avances en agroindustria, turismo y servicios, pero la diversificacion es insuficiente.",
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
          notes: "Tercero en LAC despues de Chile (44) y Mexico (56). Mejor que Brasil (62) y Peru (63).",
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
          notes: "Pilares de Innovacion y Dinamismo Empresarial entre los mas debiles.",
        },
      ],
      keyProblems: [
        "~30% de las exportaciones son petroleo y carbon — si baja el crudo, sufrimos",
        "58% de los colombianos trabajan informal — sin contrato, sin seguro, sin futuro",
        "El crecimiento economico se freno a 1.6% en 2023 — lejos del promedio historico",
        "Chile gana casi tres veces mas que Colombia per capita",
        "La productividad laboral es baja comparada con paises OCDE",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile diversifico mas alla de la mineria hacia servicios financieros, agroindustria, energia renovable y tecnologia. Mantuvo apertura comercial con multiples TLCs y reformas pro-empresa.",
      keyMetric: "PIB per capita Chile: USD 17,200 vs Colombia: USD 6,600",
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
      "El 97% esta afiliado al sistema de salud, pero las EPS estan en crisis, las filas son eternas y la atencion llega tarde. Eso no es salud.",
    whyItMatters:
      "Colombia tiene un sistema de salud con cobertura casi universal en el papel — la Ley 100 de 1993 fue revolucionaria. Pero el sistema de EPS esta en crisis: deudas billonarias, demoras en autorizaciones, pacientes que se mueren esperando una cita. En regiones como Choco, Guainia o Vaupes, la atencion medica es practicamente inexistente. La esperanza de vida es 73.7 anos — un chileno vive 79, mas de 5 anos mas.",
    dataPoints: [
      "97% de colombianos estan afiliados al SGSSS — alta cobertura en papel",
      "Las EPS acumulan deudas billonarias y varias han sido liquidadas",
      "En el Choco y la Amazonia, la atencion medica es casi inexistente",
      "Esperanza de vida: 73.7 anos — un chileno vive 79, mas de 5 anos mas",
    ],
    peruStatus: {
      summary:
        "Colombia tiene alta cobertura de afiliacion pero el sistema de EPS esta en crisis profunda. Deudas billonarias, demoras en autorizaciones, y desigualdad enorme entre las ciudades principales y las regiones apartadas. La Ley 100 fue visionaria pero su implementacion fallo.",
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
          notes: "Esperanza de vida: 73.7 anos. Chile: 78.9 anos. Costa Rica: 80.3 anos.",
        },
      ],
      keyProblems: [
        "Las EPS acumulan deudas billonarias y el sistema financiero del SGSSS esta al borde del colapso",
        "Las autorizaciones medicas tardan semanas — pacientes esperando cirugia o tratamientos criticos",
        "En regiones como Choco, Guainia y Vaupes, la infraestructura de salud es minima",
        "La tutela se convirtio en la via principal para acceder a servicios de salud — eso no es normal",
        "Mortalidad materna e infantil sigue siendo alta en zonas rurales y comunidades etnicas",
      ],
    },
    benchmark: {
      country: "Costa Rica",
      description:
        "Costa Rica abolio su ejercito en 1948 y redirigio esos recursos a salud y educacion. Su sistema de salud (CCSS) logra cobertura universal efectiva con esperanza de vida de 80.3 anos, comparable a paises desarrollados.",
      keyMetric: "Esperanza de vida Costa Rica: 80.3 anos vs Colombia: 73.7 anos",
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
      "Colombia es uno de los paises mas desiguales de America Latina. Un joven en Bogota tiene oportunidades radicalmente distintas a uno en Choco o Guaviare.",
    whyItMatters:
      "Con un Gini de 51.5, Colombia es uno de los paises mas desiguales del mundo. Un tercio de los colombianos vive en pobreza y las brechas territoriales son inmensas. Si naciste en el Choco, tu esperanza de vida es anos menor que si naciste en Bogota. El conflicto armado desplazo a mas de 8 millones de personas, creando una crisis humanitaria que aun no se resuelve. La pandemia agravo todo — la pobreza salto varios puntos de un ano a otro.",
    dataPoints: [
      "Gini de 51.5 — uno de los paises mas desiguales de America Latina y del mundo",
      "33.3% de colombianos son pobres segun el DANE",
      "Mas de 8 millones de desplazados internos por el conflicto armado",
      "La brecha entre Bogota y departamentos como Choco, La Guajira o Vaupes es abismal",
    ],
    peruStatus: {
      summary:
        "Colombia es uno de los paises mas desiguales del mundo. La pobreza afecta a un tercio de la poblacion y la desigualdad territorial es extrema. El conflicto armado genero mas de 8 millones de desplazados cuya situacion sigue sin resolverse plenamente. Los programas sociales (Familias en Accion, Ingreso Solidario) ayudan pero no resuelven el problema estructural.",
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
        "Gini de 51.5 — desigualdad de las mas altas del mundo",
        "33.3% vive en pobreza — y en regiones como La Guajira supera el 60%",
        "Mas de 8 millones de desplazados internos — la mayor crisis de desplazamiento de LAC",
        "Si naces en el Choco, tus oportunidades son radicalmente menores que si naces en Bogota",
        "Las comunidades indigenas y afrocolombianas sufren marginalidad sistematica",
      ],
    },
    benchmark: {
      country: "Uruguay",
      description:
        "Uruguay implemento politicas sociales universales con amplia cobertura, un sistema de seguridad social robusto y politicas de inclusion efectivas. Tiene el Gini mas bajo de America Latina (~39) y los menores niveles de pobreza de la region.",
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
    name: "El Estado Necesita Mas Recursos",
    nameEn: "Fiscal Capacity & Public Management",
    icon: "Wallet",
    color: "cyan",
    shortDescription:
      "Colombia recauda mas que Peru pero menos que el promedio regional. La informalidad, la evasion y la dependencia del petroleo limitan los ingresos del Estado.",
    whyItMatters:
      "El Estado colombiano recauda 19.4% del PIB en impuestos — mejor que Peru (17%) pero por debajo del promedio LAC (21.3%) y lejos de la OCDE (33.8%). Sin plata suficiente no puedes construir hospitales, pagar buenos profesores ni hacer vias. La informalidad (58% del empleo) y la evasion tributaria reducen la base fiscal. La dependencia de los ingresos petroleros hace que cuando baja el crudo, al Estado se le acaba la plata.",
    dataPoints: [
      "Colombia recauda 19.4% del PIB — por debajo del promedio LAC (21.3%) y lejos de la OCDE (33.8%)",
      "La reforma tributaria de 2022 busco aumentar la recaudacion pero los resultados son mixtos",
      "58% del empleo es informal — no genera impuestos directos",
      "La dependencia de ingresos petroleros hace fragil la posicion fiscal",
    ],
    peruStatus: {
      summary:
        "Colombia recauda mas que Peru pero todavia insuficiente para las necesidades del pais. La evasion tributaria es alta, la informalidad limita la base fiscal, y la dependencia del petroleo hace los ingresos volatiles. La reforma tributaria de 2022 fue un esfuerzo pero no resuelve el problema estructural.",
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
          notes: "Por encima de Peru (17%) pero debajo del promedio LAC (21.3%). OCDE promedio: 33.8%.",
        },
      ],
      keyProblems: [
        "Recaudamos menos que el promedio regional — 19.4% vs 21.3% de LAC",
        "La evasion tributaria es estimada en varios puntos del PIB",
        "58% del empleo es informal — no genera ingresos fiscales directos",
        "Los ingresos petroleros son volatiles y representan una porcion importante del presupuesto",
        "El gasto publico es ineficiente — los recursos no llegan donde mas se necesitan",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene una recaudacion tributaria alrededor del 21% del PIB, con reformas tributarias progresivas, una administracion fiscal mas eficiente (SII) y menor informalidad (~27% del empleo).",
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
      "Colombia ha vivido mas de 50 anos de conflicto armado que dejo mas de 9 millones de victimas. El Acuerdo de Paz de 2016 fue historico pero su implementacion es lenta e incompleta. Hoy persisten grupos armados (ELN, disidencias de FARC, bandas criminales), el narcotrafico sigue siendo un motor de violencia, y la tasa de homicidios aunque ha bajado significativamente, sigue siendo alta. En las ciudades, la inseguridad urbana es la preocupacion principal. Colombia esta en el puesto 89 de 143 en estado de derecho.",
    dataPoints: [
      "Colombia esta en el puesto 89 de 143 paises en estado de derecho",
      "Mas de 9 millones de victimas del conflicto armado registradas",
      "La implementacion del Acuerdo de Paz avanza pero con retrasos significativos",
      "El narcotrafico sigue siendo un motor principal de violencia en el pais",
    ],
    peruStatus: {
      summary:
        "Colombia ha logrado avances historicos con el Acuerdo de Paz de 2016 pero la violencia persiste. Grupos armados ilegales, narcotrafico y criminalidad organizada afectan especialmente las zonas rurales. La justicia es lenta y la impunidad alta. La JEP (Justicia Especial para la Paz) es innovadora pero enfrenta resistencias.",
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
          notes: "Debilidades en justicia penal, orden y seguridad. La JEP es un mecanismo innovador pero su efectividad aun se evalua.",
        },
      ],
      keyProblems: [
        "Persisten grupos armados ilegales (ELN, disidencias FARC, bandas criminales)",
        "El narcotrafico sigue siendo motor de violencia — Colombia es primer productor mundial de coca",
        "La tasa de homicidios ha bajado pero sigue siendo alta para estandares internacionales",
        "La justicia es lenta — los procesos duran anos y la impunidad supera el 90%",
        "Los lideres sociales y excombatientes son asesinados sistematicamente",
      ],
    },
    benchmark: {
      country: "Chile",
      description:
        "Chile tiene un sistema judicial mas independiente y eficiente, con reformas procesales penales exitosas. Se ubica en el puesto 27 del WJP Rule of Law Index, entre los mejores de America Latina junto con Uruguay y Costa Rica.",
      keyMetric: "Chile: puesto 27/143 en Rule of Law Index vs Colombia: 89/143",
    },
    frameworks: ["wjp-roli", "wb-wgi", "wef-gci"],
    relatedPillars: ["institucionalidad", "anticorrupcion"],
  },
];
