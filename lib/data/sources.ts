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
  medio_comunicacion: "Medios de Comunicacion",
  fact_checking: "Fact-Checking",
  academia: "Academia e Investigacion",
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
      "Empresa global de investigacion de mercados con presencia en Peru desde 1963. Referente en encuestas electorales en America Latina.",
    url: "https://www.ipsos.com/es-pe",
    reliability: 92,
    methodology: "Presencial + telefonica",
    sampleSize: "1,500",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Miembro de ESOMAR y WAPOR. Registro historico de predicciones electorales con margen de error menor al 3%. Publica ficha tecnica completa con cada encuesta.",
    usedIn: ["Encuestas", "Dashboard", "Simulador"],
  },
  {
    id: "cpi",
    name: "Compania Peruana de Estudios de Mercados y Opinion Publica",
    shortName: "CPI",
    category: "encuestadora",
    description:
      "Empresa peruana de investigacion de mercados fundada en 1968. Una de las mas antiguas del pais.",
    url: "https://www.cpi.pe",
    reliability: 88,
    methodology: "Presencial",
    sampleSize: "1,200",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Mas de 55 anos de experiencia en el mercado peruano. Registrada ante el JNE para publicacion de encuestas electorales. Cobertura nacional urbano-rural.",
    usedIn: ["Encuestas", "Dashboard"],
  },
  {
    id: "datum",
    name: "Datum Internacional",
    shortName: "Datum",
    category: "encuestadora",
    description:
      "Consultora peruana de investigacion de mercados y opinion publica, parte de la red WIN International.",
    url: "https://www.datum.com.pe",
    reliability: 90,
    methodology: "Presencial + online",
    sampleSize: "1,400",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Miembro de WIN International (red global de encuestadoras). Registro ante JNE. Metodologia mixta que amplia cobertura demografica.",
    usedIn: ["Encuestas", "Dashboard"],
  },
  {
    id: "iep",
    name: "Instituto de Estudios Peruanos",
    shortName: "IEP",
    category: "encuestadora",
    description:
      "Centro de investigacion en ciencias sociales fundado en 1964. Realiza encuestas de opinion y estudios politicos.",
    url: "https://iep.org.pe",
    reliability: 91,
    methodology: "Presencial + telefonica",
    sampleSize: "1,300",
    updateFrequency: "Mensual en periodo electoral",
    whyReliable:
      "Institucion academica con mas de 60 anos de investigacion. Publica metodologia detallada. Equipo multidisciplinario de politologos y estadisticos.",
    usedIn: ["Encuestas", "Dashboard", "Simulador"],
  },

  // --- ORGANISMOS ELECTORALES ---
  {
    id: "jne",
    name: "Jurado Nacional de Elecciones",
    shortName: "JNE",
    category: "organismo_electoral",
    description:
      "Organo constitucional autonomo que administra justicia electoral y fiscaliza los procesos electorales del Peru.",
    url: "https://www.jne.gob.pe",
    reliability: 98,
    updateFrequency: "Continua",
    whyReliable:
      "Organo constitucional autonomo. Fuente oficial y definitiva de resultados electorales. Datos de padron electoral, candidatos inscritos, resoluciones y cronograma oficial.",
    usedIn: ["Verificador", "Candidatos", "En Vivo", "Dashboard"],
  },
  {
    id: "onpe",
    name: "Oficina Nacional de Procesos Electorales",
    shortName: "ONPE",
    category: "organismo_electoral",
    description:
      "Organismo autonomo encargado de organizar, ejecutar y supervisar los procesos electorales en el Peru.",
    url: "https://www.onpe.gob.pe",
    reliability: 98,
    updateFrequency: "Continua",
    whyReliable:
      "Organo constitucional. Responsable del conteo oficial de votos, logistica electoral y financiamiento de partidos. Publica resultados en tiempo real el dia de la eleccion.",
    usedIn: ["Verificador", "En Vivo", "Mapa Electoral"],
  },
  {
    id: "reniec",
    name: "Registro Nacional de Identificacion y Estado Civil",
    shortName: "RENIEC",
    category: "organismo_electoral",
    description:
      "Organismo autonomo encargado del registro de identificacion de ciudadanos y del padron electoral.",
    url: "https://www.reniec.gob.pe",
    reliability: 97,
    updateFrequency: "Continua",
    whyReliable:
      "Fuente oficial del padron electoral con datos biometricos. Sistema de verificacion de identidad mas robusto de Peru. Base de datos de 25.3 millones de electores.",
    usedIn: ["Verificador", "Mapa Electoral"],
  },

  // --- ORGANISMOS INTERNACIONALES ---
  {
    id: "banco-mundial",
    name: "Banco Mundial",
    shortName: "BM",
    category: "organismo_internacional",
    description:
      "Institucion financiera internacional que proporciona datos economicos, sociales y de desarrollo a nivel global.",
    url: "https://datos.bancomundial.org",
    reliability: 96,
    updateFrequency: "Trimestral / anual",
    whyReliable:
      "Estandares internacionales de recoleccion de datos. Series historicas verificables. Metodologia publica y revisada por pares. Referente global para indicadores economicos.",
    usedIn: ["Verificador", "Planes de Gobierno"],
  },
  {
    id: "fmi",
    name: "Fondo Monetario Internacional",
    shortName: "FMI",
    category: "organismo_internacional",
    description:
      "Organismo internacional que supervisa el sistema monetario global y proporciona proyecciones economicas.",
    url: "https://www.imf.org/es",
    reliability: 95,
    updateFrequency: "Trimestral (WEO)",
    whyReliable:
      "Proyecciones macroeconomicas respaldadas por equipos tecnicos de 190 paises miembros. World Economic Outlook como referencia estandar.",
    usedIn: ["Verificador", "Planes de Gobierno"],
  },
  {
    id: "idea",
    name: "IDEA Internacional",
    shortName: "IDEA",
    category: "organismo_internacional",
    description:
      "Organizacion intergubernamental que apoya la democracia en todo el mundo. Proporciona datos electorales comparativos.",
    url: "https://www.idea.int",
    reliability: 93,
    updateFrequency: "Anual",
    whyReliable:
      "Organizacion intergubernamental con 34 paises miembros. Base de datos electoral global con informacion de mas de 200 paises. Metodologia estandarizada para comparaciones.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- ENTIDADES DEL ESTADO ---
  {
    id: "inei",
    name: "Instituto Nacional de Estadistica e Informatica",
    shortName: "INEI",
    category: "gobierno",
    description:
      "Organismo central del sistema estadistico nacional del Peru. Responsable de censos, encuestas nacionales e indicadores socioeconomicos.",
    url: "https://www.inei.gob.pe",
    reliability: 94,
    updateFrequency: "Mensual / trimestral / anual",
    whyReliable:
      "Fuente oficial de estadisticas nacionales. Realiza el Censo Nacional, ENAHO y ENDES. Datos utilizados como base por todas las instituciones publicas y privadas del pais.",
    usedIn: ["Verificador", "Planes de Gobierno", "Mapa Electoral"],
  },
  {
    id: "mef",
    name: "Ministerio de Economia y Finanzas",
    shortName: "MEF",
    category: "gobierno",
    description:
      "Ministerio encargado de la politica economica, fiscal y presupuestal del Peru. Publica datos de presupuesto publico y deuda.",
    url: "https://www.mef.gob.pe",
    reliability: 93,
    updateFrequency: "Mensual",
    whyReliable:
      "Datos oficiales de presupuesto publico, deuda, inversion y proyecciones fiscales. Portal de Transparencia Economica con datos abiertos verificables.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },

  // --- MEDIOS DE COMUNICACION ---
  {
    id: "infobae",
    name: "Infobae Peru",
    shortName: "Infobae",
    category: "medio_comunicacion",
    description:
      "Medio digital con cobertura en America Latina. Seccion Peru con enfoque en politica, economia y sociedad.",
    url: "https://www.infobae.com/peru/",
    reliability: 82,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Medio digital de alcance regional. Equipo editorial en Peru con cobertura verificada. Miembro de la SIP (Sociedad Interamericana de Prensa).",
    usedIn: ["Noticias"],
  },
  {
    id: "andina",
    name: "Agencia Andina",
    shortName: "Andina",
    category: "medio_comunicacion",
    description:
      "Agencia de noticias oficial del Estado peruano, adscrita a la Empresa Peruana de Servicios Editoriales (Editora Peru).",
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
      "Diario fundado en 1839, el mas antiguo del Peru. Referente en periodismo de investigacion y opinion.",
    url: "https://elcomercio.pe",
    reliability: 84,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Mas de 185 anos de historia. Equipo de periodismo de investigacion (Unidad de Investigacion). Miembro de GDA (Grupo de Diarios America).",
    usedIn: ["Noticias"],
  },
  {
    id: "larepublica",
    name: "La Republica",
    shortName: "La Republica",
    category: "medio_comunicacion",
    description:
      "Diario peruano fundado en 1981 con enfoque en politica, derechos y sociedad civil.",
    url: "https://larepublica.pe",
    reliability: 82,
    updateFrequency: "Continua (24/7)",
    whyReliable:
      "Mas de 40 anos de trayectoria. Cobertura critica e independiente. Parte del Grupo La Republica con multiples medios regionales.",
    usedIn: ["Noticias"],
  },

  // --- FACT-CHECKING ---
  {
    id: "ojo-publico",
    name: "Ojo Publico",
    shortName: "Ojo Publico",
    category: "fact_checking",
    description:
      "Medio de periodismo de investigacion y fact-checking peruano. Miembro de la red IFCN (International Fact-Checking Network).",
    url: "https://ojo-publico.com",
    reliability: 90,
    updateFrequency: "Continua",
    whyReliable:
      "Certificado por la IFCN (International Fact-Checking Network). Ganador de premios internacionales de periodismo (Gabriel Garcia Marquez, Gabo). Metodologia de verificacion publica y transparente.",
    usedIn: ["Verificador", "Noticias"],
  },
  {
    id: "convoca",
    name: "Convoca.pe",
    shortName: "Convoca",
    category: "fact_checking",
    description:
      "Centro de investigacion periodistica peruano especializado en datos abiertos, poder politico y corrupcion.",
    url: "https://convoca.pe",
    reliability: 88,
    updateFrequency: "Continua",
    whyReliable:
      "Especializado en periodismo de datos y seguimiento del dinero publico. Ganador de premios de periodismo de investigacion. Base de datos publica de contratos y patrimonio de funcionarios.",
    usedIn: ["Verificador", "Radiografia"],
  },

  // --- ACADEMIA E INVESTIGACION ---
  {
    id: "latinobarometro",
    name: "Latinobarometro",
    shortName: "Latinobarometro",
    category: "academia",
    description:
      "Estudio de opinion publica que aplica anualmente encuestas en 18 paises de America Latina desde 1995.",
    url: "https://www.latinobarometro.org",
    reliability: 89,
    updateFrequency: "Anual",
    whyReliable:
      "Mas de 25 anos de series historicas comparables. Encuestas en 18 paises con metodologia estandarizada. Referencia academica para estudios de democracia y opinion publica en la region.",
    usedIn: ["Planes de Gobierno", "Verificador"],
  },
  {
    id: "transparencia",
    name: "Asociacion Civil Transparencia",
    shortName: "Transparencia",
    category: "academia",
    description:
      "Organizacion de la sociedad civil peruana dedicada a la observacion electoral y fortalecimiento democratico desde 1994.",
    url: "https://www.transparencia.org.pe",
    reliability: 91,
    updateFrequency: "Por proceso electoral",
    whyReliable:
      "Mas de 30 anos de observacion electoral independiente en Peru. Realiza conteos rapidos el dia de la eleccion. Reconocida por organismos internacionales como observador imparcial.",
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
