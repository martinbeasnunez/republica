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
  "somos-peru": "#ea580c",
  "podemos-peru": "#7c3aed",
  "pais-para-todos": "#0369a1",
  "ahora-nacion": "#059669",
  "peru-primero": "#f59e0b",
  "independiente": "#6b7280",
};

// =============================================================================
// CANDIDATOS PRESIDENCIALES — ELECCIONES PERU 2026
// Fuente: JNE (Jurado Nacional de Elecciones), lista oficial confirmada Feb 2026
// Encuestas: Ipsos (Feb 5-6, 2026) y CPI (Ene 29 - Feb 2, 2026)
// Solo se incluyen los 8 candidatos con mayor intencion de voto en encuestas
// =============================================================================

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
    bio: "Empresario y politico peruano. Actual alcalde de Lima Metropolitana. Fundador de Renovacion Popular. Lidera las encuestas para las elecciones 2026.",
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
    pollAverage: 13.3,
    pollTrend: "stable",
    pollHistory: [
      { date: "2026-02", value: 12.0, pollster: "Ipsos" },
      { date: "2026-02", value: 14.6, pollster: "CPI" },
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
    bio: "Politica peruana e hija del expresidente Alberto Fujimori. Cuarta postulacion a la presidencia. Segunda en las encuestas.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Plan integral de seguridad",
        summary: "Fuerzas Armadas controlando carceles y fronteras. Rastrillajes conjuntos con la Policia.",
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
    pollAverage: 7.3,
    pollTrend: "stable",
    pollHistory: [
      { date: "2026-02", value: 8.0, pollster: "Ipsos" },
      { date: "2026-02", value: 6.6, pollster: "CPI" },
    ],
    hasLegalIssues: true,
    legalNote: "Proceso penal por lavado de activos en curso (caso Odebrecht).",
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
    slug: "cesar-acuna",
    name: "Cesar Acuna Peralta",
    shortName: "C. Acuna",
    party: "Alianza para el Progreso",
    partySlug: "alianza-para-el-progreso",
    partyColor: "#dc2626",
    photo: "/candidates/cesar-acuna.jpg",
    age: 73,
    profession: "Empresario / Educador",
    region: "La Libertad",
    ideology: "centro-derecha",
    bio: "Empresario educativo y politico. Fundador de la Universidad Cesar Vallejo y Alianza para el Progreso. Exgobernador de La Libertad y exalcalde de Trujillo.",
    keyProposals: [
      {
        category: "educacion",
        title: "Educacion y empleo",
        summary: "Ampliacion del acceso a educacion superior y programas de capacitacion laboral.",
      },
      {
        category: "infraestructura",
        title: "Obras para el desarrollo",
        summary: "Infraestructura vial y de servicios basicos en regiones.",
      },
      {
        category: "economia",
        title: "Apoyo a emprendedores",
        summary: "Creditos blandos y simplificacion de tramites para pequenos empresarios.",
      },
    ],
    pollAverage: 4.0,
    pollTrend: "stable",
    pollHistory: [
      { date: "2026-02", value: 4.0, pollster: "Ipsos" },
      { date: "2026-02", value: 3.9, pollster: "CPI" },
    ],
    hasLegalIssues: true,
    legalNote: "Investigaciones anteriores por plagio academico. Excluido de la eleccion 2016 por entrega de dinero.",
    socialMedia: {
      facebook: "CesarAcunaPeralta",
    },
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": 1,
      "inversion-extranjera": 1,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 2,
      "educacion-publica": 2,
      "salud-universal": 1,
      "corrupcion": 0,
    },
  },
  {
    id: "4",
    slug: "mario-vizcarra",
    name: "Mario Vizcarra Larios",
    shortName: "M. Vizcarra",
    party: "Peru Primero",
    partySlug: "peru-primero",
    partyColor: "#f59e0b",
    photo: "/candidates/mario-vizcarra.jpg",
    age: 55,
    profession: "Politico",
    region: "Lima",
    ideology: "centro",
    bio: "Politico y candidato presidencial por Peru Primero. Figura emergente en las encuestas 2026, empatado en el tercer lugar.",
    keyProposals: [
      {
        category: "economia",
        title: "Reactivacion economica",
        summary: "Plan de reactivacion economica con enfoque en empleo formal y productividad.",
      },
      {
        category: "seguridad",
        title: "Seguridad integral",
        summary: "Enfoque integral de seguridad ciudadana con prevencion y tecnologia.",
      },
      {
        category: "salud",
        title: "Reforma de salud",
        summary: "Fortalecimiento del sistema de salud publica y ampliacion de cobertura efectiva.",
      },
    ],
    pollAverage: 4.4,
    pollTrend: "up",
    pollHistory: [
      { date: "2026-02", value: 4.0, pollster: "Ipsos" },
      { date: "2026-02", value: 4.7, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {},
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": 0,
      "inversion-extranjera": 1,
      "mineria": 0,
      "aborto": 0,
      "matrimonio-igualitario": 0,
      "descentralizacion": 1,
      "educacion-publica": 1,
      "salud-universal": 1,
      "corrupcion": 1,
    },
  },
  {
    id: "5",
    slug: "carlos-alvarez",
    name: "Carlos Alvarez",
    shortName: "C. Alvarez",
    party: "Pais para Todos",
    partySlug: "pais-para-todos",
    partyColor: "#0369a1",
    photo: "/candidates/carlos-alvarez.jpg",
    age: 54,
    profession: "Comediante / Comunicador",
    region: "Lima",
    ideology: "centro",
    bio: "Comediante, imitador politico y comunicador peruano. Se retiro de la comedia en enero 2026 para enfocarse en su candidatura presidencial. Candidato outsider con fuerte presencia mediatica.",
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
    pollAverage: 3.8,
    pollTrend: "stable",
    pollHistory: [
      { date: "2026-02", value: 4.0, pollster: "Ipsos" },
      { date: "2026-02", value: 3.6, pollster: "CPI" },
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
    id: "6",
    slug: "alfonso-lopez-chau",
    name: "Alfonso Lopez-Chau",
    shortName: "Lopez-Chau",
    party: "Ahora Nacion",
    partySlug: "ahora-nacion",
    partyColor: "#059669",
    photo: "/candidates/alfonso-lopez-chau.jpg",
    age: 58,
    profession: "Economista / Academico",
    region: "Lima",
    ideology: "centro-izquierda",
    bio: "Economista y academico peruano. Candidato por Ahora Nacion. Figura emergente con enfoque en politicas sociales y desarrollo economico inclusivo.",
    keyProposals: [
      {
        category: "economia",
        title: "Economia inclusiva",
        summary: "Politicas de formalizacion laboral y apoyo a la pequena empresa.",
      },
      {
        category: "educacion",
        title: "Inversion en educacion",
        summary: "Aumento sostenido del presupuesto educativo con enfoque en calidad docente.",
      },
      {
        category: "salud",
        title: "Salud universal efectiva",
        summary: "Reforma del sistema de salud para que la cobertura sea real, no solo en papel.",
      },
    ],
    pollAverage: 3.9,
    pollTrend: "up",
    pollHistory: [
      { date: "2026-02", value: 4.0, pollster: "Ipsos" },
      { date: "2026-02", value: 3.7, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {},
    quizPositions: {
      "pena-muerte": -1,
      "estado-empresario": 1,
      "inversion-extranjera": 0,
      "mineria": -1,
      "aborto": 0,
      "matrimonio-igualitario": 1,
      "descentralizacion": 2,
      "educacion-publica": 2,
      "salud-universal": 2,
      "corrupcion": 1,
    },
  },
  {
    id: "7",
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
    bio: "Exarquero profesional y exalcalde de La Victoria. Figura politica joven y mediatica. Candidato por Somos Peru.",
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
    pollAverage: 2.0,
    pollTrend: "down",
    pollHistory: [
      { date: "2026-02", value: 2.0, pollster: "Ipsos" },
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
    id: "8",
    slug: "jose-luna-galvez",
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
    bio: "Empresario educativo, fundador de la Universidad Telesup. Fundador de Podemos Peru. Candidato presidencial.",
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
    pollAverage: 2.0,
    pollTrend: "stable",
    pollHistory: [
      { date: "2026-02", value: 2.0, pollster: "Ipsos" },
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
