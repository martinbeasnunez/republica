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
  // --- ENCUESTADORAS ---
  {
    id: "ipsos",
    name: "Ipsos Peru",
    shortName: "Ipsos",
    category: "encuestadora",
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

  // --- ORGANISMOS ELECTORALES ---
  {
    id: "jne",
    name: "Jurado Nacional de Elecciones",
    shortName: "JNE",
    category: "organismo_electoral",
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
    description:
      "Organismo autónomo encargado del registro de identificación de ciudadanos y del padrón electoral.",
    url: "https://www.reniec.gob.pe",
    reliability: 97,
    updateFrequency: "Continua",
    whyReliable:
      "Fuente oficial del padrón electoral con datos biométricos. Sistema de verificación de identidad más robusto de Perú. Base de datos de 25.3 millones de electores.",
    usedIn: ["Verificador", "Mapa Electoral"],
  },

  // --- ORGANISMOS INTERNACIONALES ---
  {
    id: "banco-mundial",
    name: "Banco Mundial",
    shortName: "BM",
    category: "organismo_internacional",
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
    description:
      "Organización intergubernamental que apoya la democracia en todo el mundo. Proporciona datos electorales comparativos.",
    url: "https://www.idea.int",
    reliability: 93,
    updateFrequency: "Anual",
    whyReliable:
      "Organización intergubernamental con 34 países miembros. Base de datos electoral global con información de más de 200 países. Metodología estandarizada para comparaciones.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- ENTIDADES DEL ESTADO ---
  {
    id: "inei",
    name: "Instituto Nacional de Estadística e Informática",
    shortName: "INEI",
    category: "gobierno",
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
    id: "mef",
    name: "Ministerio de Economía y Finanzas",
    shortName: "MEF",
    category: "gobierno",
    description:
      "Ministerio encargado de la política económica, fiscal y presupuestal del Perú. Publica datos de presupuesto público y deuda.",
    url: "https://www.mef.gob.pe",
    reliability: 93,
    updateFrequency: "Mensual",
    whyReliable:
      "Datos oficiales de presupuesto público, deuda, inversión y proyecciones fiscales. Portal de Transparencia Económica con datos abiertos verificables.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- MEDIOS DE COMUNICACIÓN ---
  {
    id: "infobae",
    name: "Infobae Perú",
    shortName: "Infobae",
    category: "medio_comunicacion",
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
    description:
      "Diario peruano fundado en 1981 con enfoque en política, derechos y sociedad civil.",
    url: "https://larepublica.pe",
    reliability: 82,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Más de 40 años de trayectoria. Cobertura crítica e independiente. Parte del Grupo La República con múltiples medios regionales.",
    usedIn: ["Noticias"],
  },

  // --- FACT-CHECKING ---
  {
    id: "ojo-publico",
    name: "Ojo Público",
    shortName: "Ojo Público",
    category: "fact_checking",
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
    description:
      "Centro de investigación periodística peruano especializado en datos abiertos, poder político y corrupción.",
    url: "https://convoca.pe",
    reliability: 88,
    updateFrequency: "Continua",
    whyReliable:
      "Especializado en periodismo de datos y seguimiento del dinero público. Ganador de premios de periodismo de investigación. Base de datos pública de contratos y patrimonio de funcionarios.",
    usedIn: ["Verificador", "Radiografia"],
  },

  // --- ACADEMIA E INVESTIGACIÓN ---
  {
    id: "latinobarometro",
    name: "Latinobarometro",
    shortName: "Latinobarometro",
    category: "academia",
    description:
      "Estudio de opinión pública que aplica anualmente encuestas en 18 países de America Latina desde 1995.",
    url: "https://www.latinobarometro.org",
    reliability: 89,
    updateFrequency: "Anual",
    whyReliable:
      "Más de 25 años de series históricas comparables. Encuestas en 18 países con metodología estandarizada. Referencia académica para estudios de democracia y opinión pública en la región.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },
  {
    id: "transparencia",
    name: "Asociación Civil Transparencia",
    shortName: "Transparencia",
    category: "academia",
    description:
      "Organización de la sociedad civil peruana dedicada a la observación electoral y fortalecimiento democrático desde 1994.",
    url: "https://www.transparencia.org.pe",
    reliability: 91,
    updateFrequency: "Por proceso electoral",
    whyReliable:
      "Más de 30 años de observación electoral independiente en Perú. Realiza conteos rápidos el día de la elección. Reconocida por organismos internacionales como observador imparcial.",
    usedIn: ["En Vivo", "Verificador", "Candidatos"],
  },
];

export function getSourcesByCategory(): Record<SourceCategory, DataSource[]> {
  const grouped: Record<SourceCategory, DataSource[]> = {
    encuestadora: [],
    organismo_electoral: [],
    organismo_internacional: [],
    gobierno: [],
    medio_comunicacion: [],
    fact_checking: [],
    academia: [],
  };

  for (const source of sources) {
    grouped[source.category].push(source);
  }

  return grouped;
}

export function getSourceById(id: string): DataSource | undefined {
  return sources.find((s) => s.id === id);
}
