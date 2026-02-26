import type { CountryCode } from "@/lib/config/countries";

export type SourceCategory =
  | "encuestadora"
  | "organismo_electoral"
  | "organismo_internacional"
  | "gobierno"
  | "medio_comunicacion"
  | "fact_checking"
  | "academia";

export interface DataSource {
  id: string;
  name: string;
  shortName: string;
  category: SourceCategory;
  description: string;
  url: string;
  reliability: number; // 0-100
  methodology?: string;
  sampleSize?: string;
  updateFrequency: string;
  whyReliable: string;
  usedIn: string[]; // pages where this source is used
  logo?: string;
  /** "pe" | "co" | "all" — which country this source applies to */
  country: CountryCode | "all";
}

export const CATEGORY_LABELS: Record<SourceCategory, string> = {
  encuestadora: "Encuestadoras",
  organismo_electoral: "Organismos Electorales",
  organismo_internacional: "Organismos Internacionales",
  gobierno: "Entidades del Estado",
  medio_comunicacion: "Medios de Comunicación",
  fact_checking: "Fact-Checking",
  academia: "Academia e Investigación",
};

export const CATEGORY_COLORS: Record<SourceCategory, string> = {
  encuestadora: "#6366f1",
  organismo_electoral: "#10b981",
  organismo_internacional: "#3b82f6",
  gobierno: "#f59e0b",
  medio_comunicacion: "#8b5cf6",
  fact_checking: "#ef4444",
  academia: "#06b6d4",
};

export const sources: DataSource[] = [
  // ═══════════════════════════════════════════════════════════
  // PERU SOURCES
  // ═══════════════════════════════════════════════════════════

  // --- ENCUESTADORAS (PE) ---
  {
    id: "ipsos-pe",
    name: "Ipsos Peru",
    shortName: "Ipsos",
    category: "encuestadora",
    country: "pe",
    description:
      "Empresa global de investigación de mercados con presencia en Peru desde 1963. Referente en encuestas electorales en America Latina.",
    url: "https://www.ipsos.com/es-pe",
    reliability: 92,
    methodology: "Presencial + telefónica",
    sampleSize: "1,500",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Miembro de ESOMAR y WAPOR. Registro histórico de predicciones electorales con margen de error menor al 3%. Publica ficha técnica completa con cada encuesta.",
    usedIn: ["Encuestas", "Dashboard", "Simulador"],
  },
  {
    id: "cpi",
    name: "Compañía Peruana de Estudios de Mercados y Opinión Pública",
    shortName: "CPI",
    category: "encuestadora",
    country: "pe",
    description:
      "Empresa peruana de investigación de mercados fundada en 1968. Una de las más antiguas del país.",
    url: "https://www.cpi.pe",
    reliability: 88,
    methodology: "Presencial",
    sampleSize: "1,200",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Más de 55 años de experiencia en el mercado peruano. Registrada ante el JNE para publicación de encuestas electorales. Cobertura nacional urbano-rural.",
    usedIn: ["Encuestas", "Dashboard"],
  },
  {
    id: "datum",
    name: "Datum Internacional",
    shortName: "Datum",
    category: "encuestadora",
    country: "pe",
    description:
      "Consultora peruana de investigación de mercados y opinión pública, parte de la red WIN International.",
    url: "https://www.datum.com.pe",
    reliability: 90,
    methodology: "Presencial + online",
    sampleSize: "1,400",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Miembro de WIN International (red global de encuestadoras). Registro ante JNE. Metodología mixta que amplía cobertura demográfica.",
    usedIn: ["Encuestas", "Dashboard"],
  },
  {
    id: "iep",
    name: "Instituto de Estudios Peruanos",
    shortName: "IEP",
    category: "encuestadora",
    country: "pe",
    description:
      "Centro de investigación en ciencias sociales fundado en 1964. Realiza encuestas de opinión y estudios políticos.",
    url: "https://iep.org.pe",
    reliability: 91,
    methodology: "Presencial + telefónica",
    sampleSize: "1,300",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Institución académica con más de 60 años de investigación. Publica metodología detallada. Equipo multidisciplinario de politólogos y estadísticos.",
    usedIn: ["Encuestas", "Dashboard", "Simulador"],
  },

  // --- ORGANISMOS ELECTORALES (PE) ---
  {
    id: "jne",
    name: "Jurado Nacional de Elecciones",
    shortName: "JNE",
    category: "organismo_electoral",
    country: "pe",
    description:
      "Órgano constitucional autónomo que administra justicia electoral y fiscaliza los procesos electorales del Perú.",
    url: "https://www.jne.gob.pe",
    reliability: 98,
    updateFrequency: "Continua",
    whyReliable:
      "Órgano constitucional autónomo. Fuente oficial y definitiva de resultados electorales. Datos de padrón electoral, candidatos inscritos, resoluciones y cronograma oficial.",
    usedIn: ["Verificador", "Candidatos", "En Vivo", "Dashboard"],
  },
  {
    id: "onpe",
    name: "Oficina Nacional de Procesos Electorales",
    shortName: "ONPE",
    category: "organismo_electoral",
    country: "pe",
    description:
      "Organismo autónomo encargado de organizar, ejecutar y supervisar los procesos electorales en el Perú.",
    url: "https://www.onpe.gob.pe",
    reliability: 98,
    updateFrequency: "Continua",
    whyReliable:
      "Órgano constitucional. Responsable del conteo oficial de votos, logística electoral y financiamiento de partidos. Publica resultados en tiempo real el día de la elección.",
    usedIn: ["Verificador", "En Vivo", "Mapa Electoral"],
  },
  {
    id: "reniec",
    name: "Registro Nacional de Identificación y Estado Civil",
    shortName: "RENIEC",
    category: "organismo_electoral",
    country: "pe",
    description:
      "Organismo autónomo encargado del registro de identificación de ciudadanos y del padrón electoral.",
    url: "https://www.reniec.gob.pe",
    reliability: 97,
    updateFrequency: "Continua",
    whyReliable:
      "Fuente oficial del padrón electoral con datos biométricos. Sistema de verificación de identidad más robusto de Perú. Base de datos de 25.3 millones de electores.",
    usedIn: ["Verificador", "Mapa Electoral"],
  },

  // --- ENTIDADES DEL ESTADO (PE) ---
  {
    id: "inei",
    name: "Instituto Nacional de Estadística e Informática",
    shortName: "INEI",
    category: "gobierno",
    country: "pe",
    description:
      "Organismo central del sistema estadístico nacional del Perú. Responsable de censos, encuestas nacionales e indicadores socioeconómicos.",
    url: "https://www.inei.gob.pe",
    reliability: 94,
    updateFrequency: "Mensual / trimestral / anual",
    whyReliable:
      "Fuente oficial de estadísticas nacionales. Realiza el Censo Nacional, ENAHO y ENDES. Datos utilizados como base por todas las instituciones públicas y privadas del país.",
    usedIn: ["Verificador", "Planes de Gobierno", "Mapa Electoral"],
  },
  {
    id: "mef-pe",
    name: "Ministerio de Economía y Finanzas",
    shortName: "MEF",
    category: "gobierno",
    country: "pe",
    description:
      "Ministerio encargado de la política económica, fiscal y presupuestal del Perú. Publica datos de presupuesto público y deuda.",
    url: "https://www.mef.gob.pe",
    reliability: 93,
    updateFrequency: "Mensual",
    whyReliable:
      "Datos oficiales de presupuesto público, deuda, inversión y proyecciones fiscales. Portal de Transparencia Económica con datos abiertos verificables.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- MEDIOS DE COMUNICACIÓN (PE) ---
  {
    id: "infobae-pe",
    name: "Infobae Perú",
    shortName: "Infobae",
    category: "medio_comunicacion",
    country: "pe",
    description:
      "Medio digital con cobertura en América Latina. Sección Perú con enfoque en política, economía y sociedad.",
    url: "https://www.infobae.com/peru/",
    reliability: 82,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Medio digital de alcance regional. Equipo editorial en Perú con cobertura verificada. Miembro de la SIP (Sociedad Interamericana de Prensa).",
    usedIn: ["Noticias"],
  },
  {
    id: "andina",
    name: "Agencia Andina",
    shortName: "Andina",
    category: "medio_comunicacion",
    country: "pe",
    description:
      "Agencia de noticias oficial del Estado peruano, adscrita a la Empresa Peruana de Servicios Editoriales (Editora Perú).",
    url: "https://andina.pe",
    reliability: 85,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Agencia oficial del Estado peruano. Acceso directo a fuentes gubernamentales y comunicados oficiales. Cobertura factual con enfoque informativo.",
    usedIn: ["Noticias"],
  },
  {
    id: "elcomercio",
    name: "El Comercio",
    shortName: "El Comercio",
    category: "medio_comunicacion",
    country: "pe",
    description:
      "Diario fundado en 1839, el más antiguo del Perú. Referente en periodismo de investigación y opinión.",
    url: "https://elcomercio.pe",
    reliability: 84,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Más de 185 años de historia. Equipo de periodismo de investigación (Unidad de Investigación). Miembro de GDA (Grupo de Diarios América).",
    usedIn: ["Noticias"],
  },
  {
    id: "larepublica",
    name: "La República",
    shortName: "La República",
    category: "medio_comunicacion",
    country: "pe",
    description:
      "Diario peruano fundado en 1981 con enfoque en política, derechos y sociedad civil.",
    url: "https://larepublica.pe",
    reliability: 82,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Más de 40 años de trayectoria. Cobertura crítica e independiente. Parte del Grupo La República con múltiples medios regionales.",
    usedIn: ["Noticias"],
  },

  // --- FACT-CHECKING (PE) ---
  {
    id: "ojo-publico",
    name: "Ojo Público",
    shortName: "Ojo Público",
    category: "fact_checking",
    country: "pe",
    description:
      "Medio de periodismo de investigación y fact-checking peruano. Miembro de la red IFCN (International Fact-Checking Network).",
    url: "https://ojo-publico.com",
    reliability: 90,
    updateFrequency: "Continua",
    whyReliable:
      "Certificado por la IFCN (International Fact-Checking Network). Ganador de premios internacionales de periodismo (Gabriel García Márquez, Gabo). Metodología de verificación pública y transparente.",
    usedIn: ["Verificador", "Noticias"],
  },
  {
    id: "convoca",
    name: "Convoca.pe",
    shortName: "Convoca",
    category: "fact_checking",
    country: "pe",
    description:
      "Centro de investigación periodística peruano especializado en datos abiertos, poder político y corrupción.",
    url: "https://convoca.pe",
    reliability: 88,
    updateFrequency: "Continua",
    whyReliable:
      "Especializado en periodismo de datos y seguimiento del dinero público. Ganador de premios de periodismo de investigación. Base de datos pública de contratos y patrimonio de funcionarios.",
    usedIn: ["Verificador", "Radiografia"],
  },

  // --- ACADEMIA (PE) ---
  {
    id: "transparencia-pe",
    name: "Asociación Civil Transparencia",
    shortName: "Transparencia",
    category: "academia",
    country: "pe",
    description:
      "Organización de la sociedad civil peruana dedicada a la observación electoral y fortalecimiento democrático desde 1994.",
    url: "https://www.transparencia.org.pe",
    reliability: 91,
    updateFrequency: "Por proceso electoral",
    whyReliable:
      "Más de 30 años de observación electoral independiente en Perú. Realiza conteos rápidos el día de la elección. Reconocida por organismos internacionales como observador imparcial.",
    usedIn: ["En Vivo", "Verificador", "Candidatos"],
  },

  // ═══════════════════════════════════════════════════════════
  // COLOMBIA SOURCES
  // ═══════════════════════════════════════════════════════════

  // --- ENCUESTADORAS (CO) ---
  {
    id: "invamer",
    name: "Invamer S.A.S.",
    shortName: "Invamer",
    category: "encuestadora",
    country: "co",
    description:
      "Firma colombiana de investigación de mercados y opinión pública. Realiza la encuesta Gallup Poll Colombia desde 1994.",
    url: "https://www.invamer.com.co",
    reliability: 91,
    methodology: "Presencial + telefónica",
    sampleSize: "1,200",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Miembro de ESOMAR. Más de 30 años realizando la Gallup Poll Colombia. Registro ante el CNE. Ficha técnica pública con cada encuesta.",
    usedIn: ["Encuestas", "Dashboard", "Escenarios"],
  },
  {
    id: "datexco",
    name: "Datexco",
    shortName: "Datexco",
    category: "encuestadora",
    country: "co",
    description:
      "Empresa colombiana de investigación de mercados con más de 30 años de experiencia en encuestas políticas y electorales.",
    url: "https://www.datexco.com",
    reliability: 88,
    methodology: "Presencial + telefónica",
    sampleSize: "1,000",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Autorizada por el CNE para publicación de encuestas electorales. Aliada con medios como Caracol y El Tiempo. Metodología mixta con cobertura urbana y rural.",
    usedIn: ["Encuestas", "Dashboard"],
  },
  {
    id: "cifras-conceptos",
    name: "Cifras y Conceptos",
    shortName: "Cifras y Conceptos",
    category: "encuestadora",
    country: "co",
    description:
      "Firma consultora colombiana especializada en investigación social, política y de opinión pública.",
    url: "https://cifrasyconceptos.com",
    reliability: 90,
    methodology: "Presencial + online",
    sampleSize: "1,100",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Realiza la encuesta Polimétrica. Reconocida por análisis rigurosos de opinión pública. Registro ante CNE. Metodología publicada y revisable.",
    usedIn: ["Encuestas", "Dashboard", "Escenarios"],
  },
  {
    id: "guarumo",
    name: "Guarumo / EcoAnalítica",
    shortName: "Guarumo",
    category: "encuestadora",
    country: "co",
    description:
      "Firma colombiana de análisis de datos e investigación de opinión con enfoque digital y tecnológico.",
    url: "https://www.guarumo.com",
    reliability: 87,
    methodology: "Online + telefónica",
    sampleSize: "1,500",
    updateFrequency: "Quincenal en periodo electoral",
    whyReliable:
      "Metodología innovadora con componente digital. Aliada de medios como RCN y La FM. Muestras amplias con cobertura nacional. Autorizada por el CNE.",
    usedIn: ["Encuestas", "Dashboard"],
  },

  // --- ORGANISMOS ELECTORALES (CO) ---
  {
    id: "registraduria",
    name: "Registraduría Nacional del Estado Civil",
    shortName: "Registraduría",
    category: "organismo_electoral",
    country: "co",
    description:
      "Entidad encargada del registro civil y la organización logística de los procesos electorales en Colombia.",
    url: "https://www.registraduria.gov.co",
    reliability: 97,
    updateFrequency: "Continua",
    whyReliable:
      "Autoridad electoral oficial de Colombia. Responsable del censo electoral, organización de comicios y divulgación de resultados. Publica preconteos y escrutinios en tiempo real.",
    usedIn: ["Verificador", "Candidatos", "En Vivo", "Mapa Electoral"],
  },
  {
    id: "cne-co",
    name: "Consejo Nacional Electoral",
    shortName: "CNE",
    category: "organismo_electoral",
    country: "co",
    description:
      "Órgano de vigilancia y control de la actividad electoral en Colombia. Regula partidos, campañas y financiamiento político.",
    url: "https://www.cne.gov.co",
    reliability: 96,
    updateFrequency: "Continua",
    whyReliable:
      "Máxima autoridad de vigilancia electoral. Regula encuestas, financiamiento de campañas y propaganda electoral. Fuente oficial de resoluciones y sanciones.",
    usedIn: ["Verificador", "Candidatos", "Dashboard"],
  },
  {
    id: "moe",
    name: "Misión de Observación Electoral",
    shortName: "MOE",
    category: "organismo_electoral",
    country: "co",
    description:
      "Plataforma ciudadana de observación electoral independiente en Colombia, con presencia en todo el territorio nacional.",
    url: "https://www.moe.org.co",
    reliability: 93,
    updateFrequency: "Por proceso electoral",
    whyReliable:
      "Red de más de 300 organizaciones de la sociedad civil. Observación electoral independiente con presencia nacional. Mapas de riesgo electoral reconocidos internacionalmente.",
    usedIn: ["Verificador", "En Vivo", "Mapa Electoral"],
  },

  // --- ENTIDADES DEL ESTADO (CO) ---
  {
    id: "dane",
    name: "Departamento Administrativo Nacional de Estadística",
    shortName: "DANE",
    category: "gobierno",
    country: "co",
    description:
      "Entidad responsable de la producción de estadísticas oficiales de Colombia: censos, encuestas de hogares e indicadores económicos.",
    url: "https://www.dane.gov.co",
    reliability: 94,
    updateFrequency: "Mensual / trimestral / anual",
    whyReliable:
      "Fuente oficial de estadísticas nacionales de Colombia. Realiza el Censo Nacional, Gran Encuesta Integrada de Hogares y mediciones de pobreza. Datos base para políticas públicas.",
    usedIn: ["Verificador", "Planes de Gobierno", "Mapa Electoral"],
  },
  {
    id: "mhcp-co",
    name: "Ministerio de Hacienda y Crédito Público",
    shortName: "MinHacienda",
    category: "gobierno",
    country: "co",
    description:
      "Ministerio encargado de la política económica, fiscal y crediticia de Colombia.",
    url: "https://www.minhacienda.gov.co",
    reliability: 93,
    updateFrequency: "Mensual",
    whyReliable:
      "Datos oficiales de presupuesto general de la nación, deuda pública e indicadores fiscales. Marco Fiscal de Mediano Plazo como referencia de proyecciones económicas.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- MEDIOS DE COMUNICACIÓN (CO) ---
  {
    id: "eltiempo",
    name: "El Tiempo",
    shortName: "El Tiempo",
    category: "medio_comunicacion",
    country: "co",
    description:
      "Diario colombiano fundado en 1911. El periódico de mayor circulación en Colombia y referente en cobertura política.",
    url: "https://www.eltiempo.com",
    reliability: 84,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Más de 110 años de trayectoria. El diario más leído de Colombia. Equipo de investigación (Unidad Investigativa). Miembro de GDA (Grupo de Diarios América).",
    usedIn: ["Noticias"],
  },
  {
    id: "semana",
    name: "Revista Semana",
    shortName: "Semana",
    category: "medio_comunicacion",
    country: "co",
    description:
      "Revista semanal colombiana de política, economía y sociedad. Una de las publicaciones más influyentes del país.",
    url: "https://www.semana.com",
    reliability: 82,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Más de 40 años de historia. Cobertura política profunda con análisis de contexto. Amplia red de columnistas y analistas políticos.",
    usedIn: ["Noticias"],
  },
  {
    id: "elespectador",
    name: "El Espectador",
    shortName: "El Espectador",
    category: "medio_comunicacion",
    country: "co",
    description:
      "Diario colombiano fundado en 1887. El periódico más antiguo del país, reconocido por su periodismo de investigación.",
    url: "https://www.elespectador.com",
    reliability: 85,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Más de 135 años de historia. Periodismo de investigación premiado. Independencia editorial reconocida. Miembro de la SIP.",
    usedIn: ["Noticias"],
  },
  {
    id: "lasillavacia",
    name: "La Silla Vacía",
    shortName: "La Silla Vacía",
    category: "medio_comunicacion",
    country: "co",
    description:
      "Medio digital colombiano especializado en política y poder. Referente en periodismo político independiente.",
    url: "https://www.lasillavacia.com",
    reliability: 88,
    updateFrequency: "Continua",
    whyReliable:
      "Especializado en análisis político con fuentes directas. Detector de Mentiras reconocido. Ganador de premios de periodismo digital. Referente de la academia y la sociedad civil.",
    usedIn: ["Noticias", "Verificador"],
  },

  // --- FACT-CHECKING (CO) ---
  {
    id: "colombiacheck",
    name: "Colombiacheck",
    shortName: "Colombiacheck",
    category: "fact_checking",
    country: "co",
    description:
      "Plataforma de verificación de hechos colombiana. Miembro certificado de la IFCN (International Fact-Checking Network).",
    url: "https://colombiacheck.com",
    reliability: 91,
    updateFrequency: "Continua",
    whyReliable:
      "Certificado por la IFCN. Proyecto de la Universidad Javeriana. Metodología de verificación transparente y pública. Referente de fact-checking en Colombia y la región.",
    usedIn: ["Verificador", "Noticias"],
  },
  {
    id: "lasillavacia-detector",
    name: "La Silla Vacía — Detector de Mentiras",
    shortName: "Detector de Mentiras",
    category: "fact_checking",
    country: "co",
    description:
      "Sección de verificación de hechos de La Silla Vacía, especializada en declaraciones de funcionarios y candidatos.",
    url: "https://www.lasillavacia.com/detector-de-mentiras",
    reliability: 89,
    updateFrequency: "Continua",
    whyReliable:
      "Respaldado por La Silla Vacía, medio político de referencia. Metodología clara con categorías de chequeo. Cubre declaraciones de todos los sectores políticos sin sesgo.",
    usedIn: ["Verificador"],
  },

  // --- ACADEMIA (CO) ---
  {
    id: "transparencia-co",
    name: "Transparencia por Colombia",
    shortName: "Transparencia",
    category: "academia",
    country: "co",
    description:
      "Capítulo colombiano de Transparency International. Promueve la transparencia, la rendición de cuentas y el control ciudadano.",
    url: "https://transparenciacolombia.org.co",
    reliability: 90,
    updateFrequency: "Por proceso electoral",
    whyReliable:
      "Capítulo nacional de Transparency International. Índice de Transparencia de Entidades Públicas. Observación electoral y seguimiento a financiación de campañas.",
    usedIn: ["Verificador", "Candidatos"],
  },

  // ═══════════════════════════════════════════════════════════
  // SHARED / INTERNATIONAL SOURCES
  // ═══════════════════════════════════════════════════════════

  // --- ORGANISMOS INTERNACIONALES ---
  {
    id: "banco-mundial",
    name: "Banco Mundial",
    shortName: "BM",
    category: "organismo_internacional",
    country: "all",
    description:
      "Institución financiera internacional que proporciona datos económicos, sociales y de desarrollo a nivel global.",
    url: "https://datos.bancomundial.org",
    reliability: 96,
    updateFrequency: "Trimestral / anual",
    whyReliable:
      "Estándares internacionales de recolección de datos. Series históricas verificables. Metodología pública y revisada por pares. Referente global para indicadores económicos.",
    usedIn: ["Verificador", "Planes de Gobierno"],
  },
  {
    id: "fmi",
    name: "Fondo Monetario Internacional",
    shortName: "FMI",
    category: "organismo_internacional",
    country: "all",
    description:
      "Organismo internacional que supervisa el sistema monetario global y proporciona proyecciones económicas.",
    url: "https://www.imf.org/es",
    reliability: 95,
    updateFrequency: "Trimestral (WEO)",
    whyReliable:
      "Proyecciones macroeconómicas respaldadas por equipos técnicos de 190 países miembros. World Economic Outlook como referencia estándar.",
    usedIn: ["Verificador", "Planes de Gobierno"],
  },
  {
    id: "idea",
    name: "IDEA Internacional",
    shortName: "IDEA",
    category: "organismo_internacional",
    country: "all",
    description:
      "Organización intergubernamental que apoya la democracia en todo el mundo. Proporciona datos electorales comparativos.",
    url: "https://www.idea.int",
    reliability: 93,
    updateFrequency: "Anual",
    whyReliable:
      "Organización intergubernamental con 34 países miembros. Base de datos electoral global con información de más de 200 países. Metodología estandarizada para comparaciones.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- ACADEMIA REGIONAL ---
  {
    id: "latinobarometro",
    name: "Latinobarometro",
    shortName: "Latinobarometro",
    category: "academia",
    country: "all",
    description:
      "Estudio de opinión pública que aplica anualmente encuestas en 18 países de America Latina desde 1995.",
    url: "https://www.latinobarometro.org",
    reliability: 89,
    updateFrequency: "Anual",
    whyReliable:
      "Más de 25 años de series históricas comparables. Encuestas en 18 países con metodología estandarizada. Referencia académica para estudios de democracia y opinión pública en la región.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },
];

/** Get all sources for a given country (country-specific + shared "all") */
export function getSourcesForCountry(countryCode: string): DataSource[] {
  return sources.filter(
    (s) => s.country === countryCode || s.country === "all"
  );
}

export function getSourcesByCategory(countryCode?: string): Record<SourceCategory, DataSource[]> {
  const grouped: Record<SourceCategory, DataSource[]> = {
    encuestadora: [],
    organismo_electoral: [],
    organismo_internacional: [],
    gobierno: [],
    medio_comunicacion: [],
    fact_checking: [],
    academia: [],
  };

  const filtered = countryCode ? getSourcesForCountry(countryCode) : sources;

  for (const source of filtered) {
    grouped[source.category].push(source);
  }

  return grouped;
}

export function getSourceById(id: string): DataSource | undefined {
  return sources.find((s) => s.id === id);
}
