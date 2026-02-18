export type Ideology = "izquierda" | "centro-izquierda" | "centro" | "centro-derecha" | "derecha";

export type Category =
  | "economia"
  | "seguridad"
  | "salud"
  | "educacion"
  | "medio-ambiente"
  | "anticorrupcion"
  | "infraestructura"
  | "tecnologia";

export interface CandidateProposal {
  category: Category;
  title: string;
  summary: string;
}

export interface PollDataPoint {
  date: string;
  value: number;
  pollster: string;
}

export interface Candidate {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  party: string;
  partySlug: string;
  partyColor: string;
  photo: string;
  age: number;
  profession: string;
  region: string;
  ideology: Ideology;
  bio: string;
  keyProposals: CandidateProposal[];
  pollAverage: number;
  pollTrend: "up" | "down" | "stable";
  pollHistory: PollDataPoint[];
  hasLegalIssues: boolean;
  legalNote?: string;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  quizPositions: Record<string, number>; // -2 to +2 scale for quiz matching
}

export const PARTY_COLORS: Record<string, string> = {
  "fuerza-popular": "#ff6600",
  "renovacion-popular": "#1e3a8a",
  "alianza-para-el-progreso": "#dc2626",
  "peru-libre": "#991b1b",
  "accion-popular": "#16a34a",
  "somos-peru": "#ea580c",
  "podemos-peru": "#7c3aed",
  "avanza-pais": "#0284c7",
  "juntos-por-el-peru": "#b91c1c",
  "partido-morado": "#7c3aed",
  "fe-en-el-peru": "#0369a1",
  "peru-patria-segura": "#1d4ed8",
  "honor-y-democracia": "#059669",
  "partido-nacionalista": "#dc2626",
  "independiente": "#6b7280",
};

// Seed data - top candidates based on polls (late 2025 / early 2026)
export const candidates: Candidate[] = [
  {
    id: "1",
    slug: "rafael-lopez-aliaga",
    name: "Rafael Lopez Aliaga",
    shortName: "Lopez Aliaga",
    party: "Renovacion Popular",
    partySlug: "renovacion-popular",
    partyColor: "#1e3a8a",
    photo: "/candidates/lopez-aliaga.jpg",
    age: 62,
    profession: "Empresario",
    region: "Lima",
    ideology: "derecha",
    bio: "Empresario y politico peruano. Actual alcalde de Lima Metropolitana. Fundador de Renovacion Popular.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Mano dura contra la delincuencia",
        summary: "Pena de muerte para violadores y sicarios. Aumento del presupuesto policial.",
      },
      {
        category: "economia",
        title: "Reduccion de impuestos",
        summary: "Reduccion del IGV y simplificacion tributaria para impulsar la economia.",
      },
      {
        category: "infraestructura",
        title: "Tren de cercanias",
        summary: "Expansion del sistema de transporte masivo en Lima y principales ciudades.",
      },
    ],
    pollAverage: 12.3,
    pollTrend: "stable",
    pollHistory: [
      { date: "2025-10", value: 11.0, pollster: "Ipsos" },
      { date: "2025-11", value: 11.8, pollster: "CPI" },
      { date: "2025-12", value: 12.5, pollster: "Datum" },
      { date: "2026-01", value: 12.1, pollster: "Ipsos" },
      { date: "2026-02", value: 12.3, pollster: "IEP" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@rabordealiaga",
      facebook: "RafaelLopezAliagaOficial",
    },
    quizPositions: {
      "pena-muerte": 2,
      "estado-empresario": -2,
      "inversion-extranjera": 2,
      "mineria": 2,
      "aborto": -2,
      "matrimonio-igualitario": -2,
      "descentralizacion": 1,
      "educacion-publica": 0,
      "salud-universal": 0,
      "corrupcion": 1,
    },
  },
  {
    id: "2",
    slug: "keiko-fujimori",
    name: "Keiko Fujimori",
    shortName: "K. Fujimori",
    party: "Fuerza Popular",
    partySlug: "fuerza-popular",
    partyColor: "#ff6600",
    photo: "/candidates/keiko-fujimori.jpg",
    age: 51,
    profession: "Politica",
    region: "Lima",
    ideology: "derecha",
    bio: "Politica peruana e hija del expresidente Alberto Fujimori. Cuarta postulacion a la presidencia.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Plan integral de seguridad",
        summary: "Estado de emergencia nacional contra la criminalidad organizada.",
      },
      {
        category: "economia",
        title: "Economia social de mercado",
        summary: "Estabilidad macroeconomica con programas sociales focalizados.",
      },
      {
        category: "anticorrupcion",
        title: "Reforma del sistema judicial",
        summary: "Modernizacion del poder judicial y fiscalia.",
      },
    ],
    pollAverage: 10.8,
    pollTrend: "up",
    pollHistory: [
      { date: "2025-10", value: 9.2, pollster: "Ipsos" },
      { date: "2025-11", value: 9.8, pollster: "CPI" },
      { date: "2025-12", value: 10.5, pollster: "Datum" },
      { date: "2026-01", value: 10.9, pollster: "Ipsos" },
      { date: "2026-02", value: 10.8, pollster: "IEP" },
    ],
    hasLegalIssues: true,
    legalNote: "Proceso penal por lavado de activos en curso.",
    socialMedia: {
      twitter: "@KeikoFujimori",
      facebook: "KeikoFujimori",
      instagram: "keiko.fujimori",
    },
    quizPositions: {
      "pena-muerte": 1,
      "estado-empresario": -1,
      "inversion-extranjera": 2,
      "mineria": 2,
      "aborto": -2,
      "matrimonio-igualitario": -2,
      "descentralizacion": 0,
      "educacion-publica": 1,
      "salud-universal": 1,
      "corrupcion": 1,
    },
  },
  {
    id: "3",
    slug: "carlos-alvarez",
    name: "Carlos Alvarez",
    shortName: "C. Alvarez",
    party: "Fe en el Peru",
    partySlug: "fe-en-el-peru",
    partyColor: "#0369a1",
    photo: "/candidates/carlos-alvarez.jpg",
    age: 54,
    profession: "Comediante / Comunicador",
    region: "Lima",
    ideology: "centro",
    bio: "Comediante, imitador politico y comunicador peruano. Candidato outsider con fuerte presencia mediatica.",
    keyProposals: [
      {
        category: "anticorrupcion",
        title: "Lucha frontal contra la corrupcion",
        summary: "Muerte civil para funcionarios corruptos y transparencia total del gasto publico.",
      },
      {
        category: "educacion",
        title: "Educacion de calidad",
        summary: "Aumento del presupuesto educativo al 6% del PBI.",
      },
      {
        category: "salud",
        title: "Salud para todos",
        summary: "Ampliacion de cobertura del SIS y construccion de hospitales.",
      },
    ],
    pollAverage: 8.5,
    pollTrend: "up",
    pollHistory: [
      { date: "2025-10", value: 5.1, pollster: "Ipsos" },
      { date: "2025-11", value: 6.3, pollster: "CPI" },
      { date: "2025-12", value: 7.2, pollster: "Datum" },
      { date: "2026-01", value: 8.0, pollster: "Ipsos" },
      { date: "2026-02", value: 8.5, pollster: "IEP" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@carlosalvarezpe",
      facebook: "CarlosAlvarezComediante",
      tiktok: "@carlosalvarez",
    },
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": 0,
      "inversion-extranjera": 1,
      "mineria": 0,
      "aborto": 0,
      "matrimonio-igualitario": 0,
      "descentralizacion": 2,
      "educacion-publica": 2,
      "salud-universal": 2,
      "corrupcion": 2,
    },
  },
  {
    id: "4",
    slug: "george-forsyth",
    name: "George Forsyth",
    shortName: "Forsyth",
    party: "Somos Peru",
    partySlug: "somos-peru",
    partyColor: "#ea580c",
    photo: "/candidates/george-forsyth.jpg",
    age: 44,
    profession: "Exfutbolista / Politico",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Exarquero profesional y exalcalde de La Victoria. Figura politica joven y mediatica.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Seguridad ciudadana tecnologica",
        summary: "Sistema integrado de videovigilancia y patrullaje inteligente.",
      },
      {
        category: "economia",
        title: "Peru digital",
        summary: "Digitalizacion del estado y fomento del emprendimiento tecnologico.",
      },
      {
        category: "infraestructura",
        title: "Ciudades modernas",
        summary: "Regeneracion urbana y vivienda social en principales ciudades.",
      },
    ],
    pollAverage: 6.2,
    pollTrend: "stable",
    pollHistory: [
      { date: "2025-10", value: 6.5, pollster: "Ipsos" },
      { date: "2025-11", value: 6.0, pollster: "CPI" },
      { date: "2025-12", value: 6.3, pollster: "Datum" },
      { date: "2026-01", value: 6.1, pollster: "Ipsos" },
      { date: "2026-02", value: 6.2, pollster: "IEP" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@George_Forsyth",
      facebook: "GeorgeForsythSommer",
      instagram: "georgeforsyth",
    },
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": -1,
      "inversion-extranjera": 2,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": 0,
      "descentralizacion": 1,
      "educacion-publica": 1,
      "salud-universal": 1,
      "corrupcion": 2,
    },
  },
  {
    id: "5",
    slug: "hernan-de-la-torre",
    name: "Hernan de la Torre",
    shortName: "De la Torre",
    party: "Accion Popular",
    partySlug: "accion-popular",
    partyColor: "#16a34a",
    photo: "/candidates/hernan-de-la-torre.jpg",
    age: 58,
    profession: "Abogado / Politico",
    region: "Cusco",
    ideology: "centro",
    bio: "Politico y abogado peruano. Representa la tradicion de Accion Popular fundada por Fernando Belaunde.",
    keyProposals: [
      {
        category: "infraestructura",
        title: "Conectividad nacional",
        summary: "Red de carreteras y conectividad digital para todas las regiones.",
      },
      {
        category: "economia",
        title: "Agro potencia",
        summary: "Tecnificacion de la agricultura y apoyo al agro exportador.",
      },
      {
        category: "educacion",
        title: "Educacion tecnica",
        summary: "Red de institutos tecnicos de excelencia en cada region.",
      },
    ],
    pollAverage: 4.1,
    pollTrend: "down",
    pollHistory: [
      { date: "2025-10", value: 5.2, pollster: "Ipsos" },
      { date: "2025-11", value: 4.8, pollster: "CPI" },
      { date: "2025-12", value: 4.5, pollster: "Datum" },
      { date: "2026-01", value: 4.2, pollster: "Ipsos" },
      { date: "2026-02", value: 4.1, pollster: "IEP" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@hernandltorre",
      facebook: "HernanDeLaTorre",
    },
    quizPositions: {
      "pena-muerte": -1,
      "estado-empresario": 0,
      "inversion-extranjera": 1,
      "mineria": 0,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 2,
      "educacion-publica": 2,
      "salud-universal": 1,
      "corrupcion": 1,
    },
  },
  {
    id: "6",
    slug: "jose-luna",
    name: "Jose Luna Galvez",
    shortName: "Luna",
    party: "Podemos Peru",
    partySlug: "podemos-peru",
    partyColor: "#7c3aed",
    photo: "/candidates/jose-luna.jpg",
    age: 67,
    profession: "Empresario / Educador",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Empresario educativo, fundador de la Universidad Telesup. Fundador de Podemos Peru.",
    keyProposals: [
      {
        category: "educacion",
        title: "Universidad para todos",
        summary: "Becas integrales y ampliacion del acceso a educacion superior.",
      },
      {
        category: "economia",
        title: "Empleo joven",
        summary: "Programa nacional de primer empleo y capacitacion laboral.",
      },
      {
        category: "tecnologia",
        title: "Peru conectado",
        summary: "Internet gratuito en zonas rurales y digitalizacion de servicios.",
      },
    ],
    pollAverage: 3.8,
    pollTrend: "stable",
    pollHistory: [
      { date: "2025-10", value: 3.5, pollster: "Ipsos" },
      { date: "2025-11", value: 3.7, pollster: "CPI" },
      { date: "2025-12", value: 3.9, pollster: "Datum" },
      { date: "2026-01", value: 3.8, pollster: "Ipsos" },
      { date: "2026-02", value: 3.8, pollster: "IEP" },
    ],
    hasLegalIssues: true,
    legalNote: "Investigado por presunto financiamiento ilicito de campanas.",
    socialMedia: {
      facebook: "JoseLunaGalvezOficial",
    },
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": 1,
      "inversion-extranjera": 1,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 0,
      "educacion-publica": 2,
      "salud-universal": 1,
      "corrupcion": 0,
    },
  },
  {
    id: "7",
    slug: "antauro-humala",
    name: "Antauro Humala",
    shortName: "A. Humala",
    party: "Union por el Peru",
    partySlug: "juntos-por-el-peru",
    partyColor: "#b91c1c",
    photo: "/candidates/antauro-humala.jpg",
    age: 62,
    profession: "Militar retirado / Politico",
    region: "Lima",
    ideology: "izquierda",
    bio: "Militar retirado y politico radical. Hermano del expresidente Ollanta Humala. Lider del etnocacerismo.",
    keyProposals: [
      {
        category: "economia",
        title: "Nacionalizacion de recursos",
        summary: "Recuperacion de los recursos naturales para el estado peruano.",
      },
      {
        category: "anticorrupcion",
        title: "Pena de muerte para corruptos",
        summary: "Castigos severos incluyendo pena capital para delitos de corrupcion.",
      },
      {
        category: "seguridad",
        title: "Fuerzas armadas en las calles",
        summary: "Militarizacion de la seguridad ciudadana en zonas criticas.",
      },
    ],
    pollAverage: 5.1,
    pollTrend: "down",
    pollHistory: [
      { date: "2025-10", value: 6.8, pollster: "Ipsos" },
      { date: "2025-11", value: 6.2, pollster: "CPI" },
      { date: "2025-12", value: 5.8, pollster: "Datum" },
      { date: "2026-01", value: 5.3, pollster: "Ipsos" },
      { date: "2026-02", value: 5.1, pollster: "IEP" },
    ],
    hasLegalIssues: true,
    legalNote: "Antecedentes penales por el Andahuaylazo (2005). Cumplio condena.",
    socialMedia: {
      facebook: "AntauroHumalaOficial",
    },
    quizPositions: {
      "pena-muerte": 2,
      "estado-empresario": 2,
      "inversion-extranjera": -2,
      "mineria": -2,
      "aborto": -1,
      "matrimonio-igualitario": -2,
      "descentralizacion": 1,
      "educacion-publica": 2,
      "salud-universal": 2,
      "corrupcion": 2,
    },
  },
  {
    id: "8",
    slug: "daniel-urresti",
    name: "Daniel Urresti",
    shortName: "Urresti",
    party: "Peru Patria Segura",
    partySlug: "peru-patria-segura",
    partyColor: "#1d4ed8",
    photo: "/candidates/daniel-urresti.jpg",
    age: 68,
    profession: "Militar retirado / Politico",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "General retirado del ejercito. Exministro del Interior. Conocido por su postura firme en seguridad.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Tolerancia cero",
        summary: "Plan integral de seguridad con mano dura contra el crimen organizado.",
      },
      {
        category: "seguridad",
        title: "Reforma policial",
        summary: "Modernizacion y equipamiento de la Policia Nacional del Peru.",
      },
      {
        category: "anticorrupcion",
        title: "Gobierno transparente",
        summary: "Plataforma digital de transparencia del gasto publico en tiempo real.",
      },
    ],
    pollAverage: 3.2,
    pollTrend: "stable",
    pollHistory: [
      { date: "2025-10", value: 3.0, pollster: "Ipsos" },
      { date: "2025-11", value: 3.1, pollster: "CPI" },
      { date: "2025-12", value: 3.3, pollster: "Datum" },
      { date: "2026-01", value: 3.2, pollster: "Ipsos" },
      { date: "2026-02", value: 3.2, pollster: "IEP" },
    ],
    hasLegalIssues: true,
    legalNote: "Fue procesado por el caso Hugo Bustios. Absuelto en 2023.",
    socialMedia: {
      twitter: "@DanielUrresti1",
      facebook: "DanielUrrestiOficial",
    },
    quizPositions: {
      "pena-muerte": 1,
      "estado-empresario": -1,
      "inversion-extranjera": 1,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 0,
      "educacion-publica": 1,
      "salud-universal": 1,
      "corrupcion": 2,
    },
  },
];

export function getCandidateBySlug(slug: string): Candidate | undefined {
  return candidates.find((c) => c.slug === slug);
}

export function getCandidatesByIdeology(ideology: Ideology): Candidate[] {
  return candidates.filter((c) => c.ideology === ideology);
}

export function getTopCandidates(count: number = 5): Candidate[] {
  return [...candidates].sort((a, b) => b.pollAverage - a.pollAverage).slice(0, count);
}

export const CATEGORIES_LABELS: Record<Category, { es: string; en: string }> = {
  economia: { es: "Economia", en: "Economy" },
  seguridad: { es: "Seguridad", en: "Security" },
  salud: { es: "Salud", en: "Health" },
  educacion: { es: "Educacion", en: "Education" },
  "medio-ambiente": { es: "Medio Ambiente", en: "Environment" },
  anticorrupcion: { es: "Anticorrupcion", en: "Anti-corruption" },
  infraestructura: { es: "Infraestructura", en: "Infrastructure" },
  tecnologia: { es: "Tecnologia", en: "Technology" },
};

export const IDEOLOGY_LABELS: Record<Ideology, { es: string; en: string }> = {
  izquierda: { es: "Izquierda", en: "Left" },
  "centro-izquierda": { es: "Centro-Izquierda", en: "Center-Left" },
  centro: { es: "Centro", en: "Center" },
  "centro-derecha": { es: "Centro-Derecha", en: "Center-Right" },
  derecha: { es: "Derecha", en: "Right" },
};
