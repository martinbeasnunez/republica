import { getSupabase } from "@/lib/supabase";

// =============================================================================
// TYPES & INTERFACES (unchanged)
// =============================================================================

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

// =============================================================================
// STATIC CONSTANTS (no DB needed)
// =============================================================================

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

export const CATEGORIES_LABELS: Record<Category, { es: string; en: string }> = {
  economia: { es: "Economía", en: "Economy" },
  seguridad: { es: "Seguridad", en: "Security" },
  salud: { es: "Salud", en: "Health" },
  educacion: { es: "Educación", en: "Education" },
  "medio-ambiente": { es: "Medio Ambiente", en: "Environment" },
  anticorrupcion: { es: "Anticorrupción", en: "Anti-corruption" },
  infraestructura: { es: "Infraestructura", en: "Infrastructure" },
  tecnologia: { es: "Tecnología", en: "Technology" },
};

export const IDEOLOGY_LABELS: Record<Ideology, { es: string; en: string }> = {
  izquierda: { es: "Izquierda", en: "Left" },
  "centro-izquierda": { es: "Centro-Izquierda", en: "Center-Left" },
  centro: { es: "Centro", en: "Center" },
  "centro-derecha": { es: "Centro-Derecha", en: "Center-Right" },
  derecha: { es: "Derecha", en: "Right" },
};

// =============================================================================
// SEED DATA (static fallback / offline)
// =============================================================================

export const candidates: Candidate[] = [
  {
    id: "1",
    slug: "rafael-lopez-aliaga",
    name: "Rafael López Aliaga",
    shortName: "López Aliaga",
    party: "Renovación Popular",
    partySlug: "renovacion-popular",
    partyColor: PARTY_COLORS["renovacion-popular"],
    photo: "https://mpesije.jne.gob.pe/apidocs/b2e00ae2-1e50-4ad3-a103-71fc7e4e8255.jpg",
    age: 63,
    profession: "Empresario",
    region: "Lima",
    ideology: "derecha",
    bio: "Empresario y político conservador, actual alcalde de Lima. Conocido por su discurso frontal contra la corrupción y su postura firme en temas de seguridad ciudadana.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Mano dura contra la delincuencia",
        summary: "Implementar pena de muerte para violadores y sicarios, y militarizar zonas de alta criminalidad.",
      },
      {
        category: "economia",
        title: "Reducción del aparato estatal",
        summary: "Eliminar ministerios innecesarios y reducir la burocracia para promover la inversión privada.",
      },
      {
        category: "infraestructura",
        title: "Modernización del transporte en Lima",
        summary: "Ampliar las líneas del Metro de Lima y reorganizar el sistema de transporte público metropolitano.",
      },
    ],
    pollAverage: 13.2,
    pollTrend: "up",
    pollHistory: [
      { date: "2025-10-01", value: 8.5, pollster: "Ipsos" },
      { date: "2025-11-01", value: 9.2, pollster: "Datum" },
      { date: "2025-12-01", value: 10.1, pollster: "IEP" },
      { date: "2026-01-01", value: 11.0, pollster: "Ipsos" },
      { date: "2026-01-15", value: 11.5, pollster: "Datum" },
      { date: "2026-02-01", value: 12.0, pollster: "IEP" },
      { date: "2026-02-08", value: 12.4, pollster: "Ipsos" },
      { date: "2026-02-15", value: 12.8, pollster: "Datum" },
      { date: "2026-02-22", value: 13.2, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@LopezAliworker",
    },
    quizPositions: {
      "pena-muerte": 2,
      "estado-empresario": -2,
      "inversion-extranjera": 2,
      "mineria": 2,
      "aborto": -2,
      "matrimonio-igualitario": -2,
      "descentralizacion": 0,
      "educacion-publica": -1,
      "salud-universal": -1,
      "corrupcion": 2,
    },
  },
  {
    id: "2",
    slug: "keiko-fujimori",
    name: "Keiko Fujimori",
    shortName: "Keiko",
    party: "Fuerza Popular",
    partySlug: "fuerza-popular",
    partyColor: PARTY_COLORS["fuerza-popular"],
    photo: "https://mpesije.jne.gob.pe/apidocs/251cd1c0-acc7-4338-bd8a-439ccb9238d0.jpeg",
    age: 49,
    profession: "Política",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Lideresa de Fuerza Popular e hija del expresidente Alberto Fujimori. Tres veces candidata presidencial con amplia base electoral en sectores populares.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Estrategia integral contra el crimen organizado",
        summary: "Fortalecer la inteligencia policial y crear unidades especializadas contra la extorsión y el narcotráfico.",
      },
      {
        category: "economia",
        title: "Reactivación económica con empleo formal",
        summary: "Incentivos tributarios para pymes y simplificación de trámites para formalizar negocios.",
      },
      {
        category: "educacion",
        title: "Reforma educativa integral",
        summary: "Mejorar la infraestructura escolar y aumentar el presupuesto destinado a la educación pública.",
      },
    ],
    pollAverage: 9.5,
    pollTrend: "down",
    pollHistory: [
      { date: "2025-10-01", value: 10.5, pollster: "Ipsos" },
      { date: "2025-11-01", value: 10.2, pollster: "Datum" },
      { date: "2025-12-01", value: 10.0, pollster: "IEP" },
      { date: "2026-01-01", value: 9.8, pollster: "Ipsos" },
      { date: "2026-01-15", value: 10.1, pollster: "Datum" },
      { date: "2026-02-01", value: 10.0, pollster: "IEP" },
      { date: "2026-02-08", value: 9.8, pollster: "Ipsos" },
      { date: "2026-02-15", value: 9.6, pollster: "Datum" },
      { date: "2026-02-22", value: 9.5, pollster: "CPI" },
    ],
    hasLegalIssues: true,
    legalNote: "Procesada por presunto lavado de activos vinculado al caso Odebrecht. Juicio en curso.",
    socialMedia: {
      twitter: "@KeikoFujimori",
    },
    quizPositions: {
      "pena-muerte": 1,
      "estado-empresario": -1,
      "inversion-extranjera": 2,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 0,
      "educacion-publica": 1,
      "salud-universal": 0,
      "corrupcion": 1,
    },
  },
  {
    id: "3",
    slug: "carlos-alvarez",
    name: "Carlos Álvarez (Carlín)",
    shortName: "Carlín",
    party: "Ahora Nación",
    partySlug: "ahora-nacion",
    partyColor: PARTY_COLORS["ahora-nacion"],
    photo: "https://mpesije.jne.gob.pe/apidocs/2bd18177-d665-413d-9694-747d729d3e39.jpg",
    age: 61,
    profession: "Comunicador y comediante",
    region: "Lima",
    ideology: "centro",
    bio: "Reconocido comediante, imitador político y comunicador peruano. Su candidatura representa una propuesta ciudadana centrada en la transparencia y la lucha anticorrupción.",
    keyProposals: [
      {
        category: "anticorrupcion",
        title: "Transparencia total en el Estado",
        summary: "Implementar plataformas digitales de gobierno abierto para fiscalizar el gasto público en tiempo real.",
      },
      {
        category: "educacion",
        title: "Educación cívica y valores democráticos",
        summary: "Incorporar programas de formación ciudadana y pensamiento crítico desde la educación primaria.",
      },
      {
        category: "tecnologia",
        title: "Digitalización de servicios públicos",
        summary: "Modernizar los trámites estatales mediante plataformas digitales accesibles para todos los peruanos.",
      },
    ],
    pollAverage: 7.8,
    pollTrend: "up",
    pollHistory: [
      { date: "2025-10-01", value: 3.0, pollster: "Ipsos" },
      { date: "2025-11-01", value: 3.8, pollster: "Datum" },
      { date: "2025-12-01", value: 4.5, pollster: "IEP" },
      { date: "2026-01-01", value: 5.2, pollster: "Ipsos" },
      { date: "2026-01-15", value: 5.6, pollster: "Datum" },
      { date: "2026-02-01", value: 6.0, pollster: "IEP" },
      { date: "2026-02-08", value: 6.8, pollster: "Ipsos" },
      { date: "2026-02-15", value: 7.3, pollster: "Datum" },
      { date: "2026-02-22", value: 7.8, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@CarlosAlvarezTV",
    },
    quizPositions: {
      "pena-muerte": -1,
      "estado-empresario": 0,
      "inversion-extranjera": 1,
      "mineria": 0,
      "aborto": 0,
      "matrimonio-igualitario": 1,
      "descentralizacion": 1,
      "educacion-publica": 2,
      "salud-universal": 1,
      "corrupcion": 2,
    },
  },
  {
    id: "4",
    slug: "george-forsyth",
    name: "George Forsyth",
    shortName: "Forsyth",
    party: "Somos Perú",
    partySlug: "somos-peru",
    partyColor: PARTY_COLORS["somos-peru"],
    photo: "https://mpesije.jne.gob.pe/apidocs/b1d60238-c797-4cba-936e-f13de6a34cc7.jpg",
    age: 42,
    profession: "Exfutbolista y político",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Exarquero de Alianza Lima y exalcalde de La Victoria. Ganó notoriedad por su gestión municipal enfocada en seguridad y orden en zonas comerciales.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Seguridad ciudadana con tecnología",
        summary: "Instalar sistemas de videovigilancia inteligente y fortalecer el serenazgo municipal a nivel nacional.",
      },
      {
        category: "economia",
        title: "Apoyo a emprendedores y pymes",
        summary: "Crear fondos de crédito accesible y capacitación para pequeños empresarios en todo el país.",
      },
    ],
    pollAverage: 4.5,
    pollTrend: "down",
    pollHistory: [
      { date: "2025-10-01", value: 7.0, pollster: "Ipsos" },
      { date: "2025-11-01", value: 6.5, pollster: "Datum" },
      { date: "2025-12-01", value: 6.0, pollster: "IEP" },
      { date: "2026-01-01", value: 5.5, pollster: "Ipsos" },
      { date: "2026-01-15", value: 5.2, pollster: "Datum" },
      { date: "2026-02-01", value: 5.0, pollster: "IEP" },
      { date: "2026-02-08", value: 4.8, pollster: "Ipsos" },
      { date: "2026-02-15", value: 4.6, pollster: "Datum" },
      { date: "2026-02-22", value: 4.5, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@GeorgeForsworker",
    },
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": -1,
      "inversion-extranjera": 1,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": 0,
      "descentralizacion": 1,
      "educacion-publica": 1,
      "salud-universal": 0,
      "corrupcion": 1,
    },
  },
  {
    id: "5",
    slug: "jose-lopez-chau",
    name: "José López-Chau",
    shortName: "López-Chau",
    party: "País para Todos",
    partySlug: "pais-para-todos",
    partyColor: PARTY_COLORS["pais-para-todos"],
    photo: "https://mpesije.jne.gob.pe/apidocs/ddfa74eb-cae3-401c-a34c-35543ae83c57.jpg",
    age: 58,
    profession: "Economista",
    region: "Lima",
    ideology: "centro-izquierda",
    bio: "Economista y académico con experiencia en políticas públicas. Propone un modelo de desarrollo inclusivo con mayor participación del Estado en sectores estratégicos.",
    keyProposals: [
      {
        category: "economia",
        title: "Industrialización y valor agregado",
        summary: "Promover la transformación productiva del país mediante incentivos a la manufactura y la agroindustria.",
      },
      {
        category: "salud",
        title: "Sistema de salud universal",
        summary: "Unificar los sistemas de salud público y crear un seguro universal con cobertura integral para todos los peruanos.",
      },
      {
        category: "educacion",
        title: "Inversión masiva en educación pública",
        summary: "Duplicar el presupuesto educativo y garantizar acceso a internet en todas las escuelas del país.",
      },
    ],
    pollAverage: 4.5,
    pollTrend: "up",
    pollHistory: [
      { date: "2025-10-01", value: 3.5, pollster: "Ipsos" },
      { date: "2025-11-01", value: 3.8, pollster: "Datum" },
      { date: "2025-12-01", value: 4.0, pollster: "IEP" },
      { date: "2026-01-01", value: 4.1, pollster: "Ipsos" },
      { date: "2026-01-15", value: 4.0, pollster: "Datum" },
      { date: "2026-02-01", value: 4.0, pollster: "IEP" },
      { date: "2026-02-08", value: 4.2, pollster: "Ipsos" },
      { date: "2026-02-15", value: 4.3, pollster: "Datum" },
      { date: "2026-02-22", value: 4.5, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@JLopezChau",
    },
    quizPositions: {
      "pena-muerte": -2,
      "estado-empresario": 2,
      "inversion-extranjera": -1,
      "mineria": -1,
      "aborto": 1,
      "matrimonio-igualitario": 1,
      "descentralizacion": 2,
      "educacion-publica": 2,
      "salud-universal": 2,
      "corrupcion": 1,
    },
  },
  {
    id: "6",
    slug: "cesar-acuna",
    name: "César Acuña",
    shortName: "Acuña",
    party: "Alianza para el Progreso",
    partySlug: "alianza-para-el-progreso",
    partyColor: PARTY_COLORS["alianza-para-el-progreso"],
    photo: "https://mpesije.jne.gob.pe/apidocs/d6fe3cac-7061-474b-8551-0aa686a54bad.jpg",
    age: 72,
    profession: "Empresario y educador",
    region: "Trujillo",
    ideology: "centro-derecha",
    bio: "Fundador de la Universidad César Vallejo y exgobernador regional de La Libertad. Empresario del sector educativo con amplia red política en provincias.",
    keyProposals: [
      {
        category: "educacion",
        title: "Becas para jóvenes de escasos recursos",
        summary: "Ampliar el programa de becas integrales para estudiantes de zonas rurales y urbano-marginales.",
      },
      {
        category: "infraestructura",
        title: "Obras de infraestructura descentralizadas",
        summary: "Ejecutar megaproyectos de agua, saneamiento y carreteras priorizando las regiones más postergadas.",
      },
      {
        category: "economia",
        title: "Impulso a la agroindustria regional",
        summary: "Fortalecer las cadenas productivas agrícolas con tecnología y acceso a mercados internacionales.",
      },
    ],
    pollAverage: 3.8,
    pollTrend: "down",
    pollHistory: [
      { date: "2025-10-01", value: 4.2, pollster: "Ipsos" },
      { date: "2025-11-01", value: 4.0, pollster: "Datum" },
      { date: "2025-12-01", value: 3.8, pollster: "IEP" },
      { date: "2026-01-01", value: 3.9, pollster: "Ipsos" },
      { date: "2026-01-15", value: 4.0, pollster: "Datum" },
      { date: "2026-02-01", value: 4.0, pollster: "IEP" },
      { date: "2026-02-08", value: 3.9, pollster: "Ipsos" },
      { date: "2026-02-15", value: 3.8, pollster: "Datum" },
      { date: "2026-02-22", value: 3.8, pollster: "CPI" },
    ],
    hasLegalIssues: true,
    legalNote: "Investigado por presunto plagio académico y cuestionamientos sobre financiamiento de campañas anteriores.",
    socialMedia: {
      twitter: "@CesarAcunaP",
    },
    quizPositions: {
      "pena-muerte": 0,
      "estado-empresario": -1,
      "inversion-extranjera": 1,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 2,
      "educacion-publica": 1,
      "salud-universal": 0,
      "corrupcion": 0,
    },
  },
  {
    id: "7",
    slug: "hernando-de-soto",
    name: "Hernando de Soto",
    shortName: "De Soto",
    party: "Independiente",
    partySlug: "independiente",
    partyColor: PARTY_COLORS["independiente"],
    photo: "/candidatos/hernando-de-soto.jpg",
    age: 83,
    profession: "Economista",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Economista de renombre internacional, autor de 'El misterio del capital'. Defensor de la formalización de la propiedad como motor del desarrollo económico.",
    keyProposals: [
      {
        category: "economia",
        title: "Formalización de la propiedad informal",
        summary: "Titular masivamente predios y negocios informales para integrarlos al sistema financiero y productivo.",
      },
      {
        category: "anticorrupcion",
        title: "Reforma institucional profunda",
        summary: "Modernizar las instituciones del Estado con estándares internacionales de transparencia y rendición de cuentas.",
      },
      {
        category: "tecnologia",
        title: "Registro digital de activos",
        summary: "Implementar tecnología blockchain para registrar propiedades y contratos, reduciendo la burocracia y el fraude.",
      },
    ],
    pollAverage: 5.2,
    pollTrend: "up",
    pollHistory: [
      { date: "2025-10-01", value: 5.5, pollster: "Ipsos" },
      { date: "2025-11-01", value: 5.2, pollster: "Datum" },
      { date: "2025-12-01", value: 5.0, pollster: "IEP" },
      { date: "2026-01-01", value: 4.8, pollster: "Ipsos" },
      { date: "2026-01-15", value: 5.0, pollster: "Datum" },
      { date: "2026-02-01", value: 5.0, pollster: "IEP" },
      { date: "2026-02-08", value: 5.0, pollster: "Ipsos" },
      { date: "2026-02-15", value: 5.1, pollster: "Datum" },
      { date: "2026-02-22", value: 5.2, pollster: "CPI" },
    ],
    hasLegalIssues: false,
    socialMedia: {
      twitter: "@HernandoDeSoto",
    },
    quizPositions: {
      "pena-muerte": -1,
      "estado-empresario": -2,
      "inversion-extranjera": 2,
      "mineria": 1,
      "aborto": 0,
      "matrimonio-igualitario": 0,
      "descentralizacion": 1,
      "educacion-publica": 0,
      "salud-universal": -1,
      "corrupcion": 2,
    },
  },
  {
    id: "8",
    slug: "daniel-urresti",
    name: "Daniel Urresti",
    shortName: "Urresti",
    party: "Podemos Perú",
    partySlug: "podemos-peru",
    partyColor: PARTY_COLORS["podemos-peru"],
    photo: "/candidatos/daniel-urresti.jpg",
    age: 69,
    profession: "Militar retirado y político",
    region: "Lima",
    ideology: "centro",
    bio: "General retirado del Ejército y excongresista. Conocido por su postura firme en seguridad ciudadana y su experiencia en la lucha contra el terrorismo.",
    keyProposals: [
      {
        category: "seguridad",
        title: "Plan nacional contra la extorsión",
        summary: "Crear una unidad élite antiextorsión y endurecer las penas para bandas criminales organizadas.",
      },
      {
        category: "seguridad",
        title: "Reforma policial integral",
        summary: "Modernizar la Policía Nacional con mejor equipamiento, capacitación y mejores condiciones salariales.",
      },
      {
        category: "infraestructura",
        title: "Construcción de hospitales regionales",
        summary: "Edificar hospitales de alta complejidad en las capitales de región para descentralizar la atención médica.",
      },
    ],
    pollAverage: 3.5,
    pollTrend: "down",
    pollHistory: [
      { date: "2025-10-01", value: 5.5, pollster: "Ipsos" },
      { date: "2025-11-01", value: 5.0, pollster: "Datum" },
      { date: "2025-12-01", value: 4.8, pollster: "IEP" },
      { date: "2026-01-01", value: 4.5, pollster: "Ipsos" },
      { date: "2026-01-15", value: 4.2, pollster: "Datum" },
      { date: "2026-02-01", value: 4.0, pollster: "IEP" },
      { date: "2026-02-08", value: 3.8, pollster: "Ipsos" },
      { date: "2026-02-15", value: 3.6, pollster: "Datum" },
      { date: "2026-02-22", value: 3.5, pollster: "CPI" },
    ],
    hasLegalIssues: true,
    legalNote: "Fue procesado por el caso del periodista Hugo Bustíos. Absuelto en segunda instancia, pero el caso generó controversia pública.",
    socialMedia: {
      twitter: "@DanielUrresti1",
    },
    quizPositions: {
      "pena-muerte": 2,
      "estado-empresario": 0,
      "inversion-extranjera": 1,
      "mineria": 1,
      "aborto": -1,
      "matrimonio-igualitario": -1,
      "descentralizacion": 1,
      "educacion-publica": 1,
      "salud-universal": 1,
      "corrupcion": 1,
    },
  },
];

/** Get top N candidates sorted by poll average (synchronous, uses seed data) */
export function getTopCandidates(count: number = 5): Candidate[] {
  return [...candidates].sort((a, b) => b.pollAverage - a.pollAverage).slice(0, count);
}

// =============================================================================
// DB ROW → Candidate MAPPER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToCandidate(row: any, pollHistory: PollDataPoint[] = []): Candidate {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    party: row.party,
    partySlug: row.party_slug,
    partyColor: row.party_color,
    photo: row.photo,
    age: row.age,
    profession: row.profession,
    region: row.region,
    ideology: row.ideology as Ideology,
    bio: row.bio,
    keyProposals: (row.key_proposals || []) as CandidateProposal[],
    pollAverage: row.poll_average,
    pollTrend: row.poll_trend as "up" | "down" | "stable",
    pollHistory,
    hasLegalIssues: row.has_legal_issues,
    legalNote: row.legal_note || undefined,
    socialMedia: (row.social_media || {}) as Candidate["socialMedia"],
    quizPositions: (row.quiz_positions || {}) as Record<string, number>,
  };
}

// =============================================================================
// ASYNC DATA FETCHING (server-side, reads from Supabase)
// =============================================================================

/** Fetch all active candidates with their poll history */
export async function fetchCandidates(countryCode?: string): Promise<Candidate[]> {
  try {
    const supabase = getSupabase();

    let candidatesQuery = supabase
      .from("candidates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    let pollsQuery = supabase
      .from("poll_data_points")
      .select("*")
      .order("date", { ascending: true });

    if (countryCode) {
      candidatesQuery = candidatesQuery.eq("country_code", countryCode);
      pollsQuery = pollsQuery.eq("country_code", countryCode);
    }

    const [candidatesRes, pollsRes] = await Promise.all([
      candidatesQuery,
      pollsQuery,
    ]);

    if (candidatesRes.error) {
      console.error("[fetchCandidates] Error:", candidatesRes.error);
      return [];
    }

    // Group polls by candidate_id
    const pollsByCandidate: Record<string, PollDataPoint[]> = {};
    if (pollsRes.data) {
      for (const p of pollsRes.data) {
        if (!pollsByCandidate[p.candidate_id]) pollsByCandidate[p.candidate_id] = [];
        pollsByCandidate[p.candidate_id].push({
          date: p.date,
          value: p.value,
          pollster: p.pollster,
        });
      }
    }

    return (candidatesRes.data || []).map((row) =>
      mapDbToCandidate(row, pollsByCandidate[row.id] || [])
    );
  } catch (err) {
    console.error("[fetchCandidates] Exception:", err);
    return [];
  }
}

/** Fetch a single candidate by slug */
export async function fetchCandidateBySlug(slug: string, countryCode?: string): Promise<Candidate | undefined> {
  try {
    const supabase = getSupabase();

    const { data: row, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !row) return undefined;

    const { data: polls } = await supabase
      .from("poll_data_points")
      .select("*")
      .eq("candidate_id", row.id)
      .order("date", { ascending: true });

    const pollHistory = (polls || []).map((p) => ({
      date: p.date,
      value: p.value,
      pollster: p.pollster,
    }));

    return mapDbToCandidate(row, pollHistory);
  } catch (err) {
    console.error("[fetchCandidateBySlug] Exception:", err);
    return undefined;
  }
}

/** Fetch top N candidates by poll average */
export async function fetchTopCandidates(count: number = 5, countryCode?: string): Promise<Candidate[]> {
  try {
    const supabase = getSupabase();

    let query = supabase
      .from("candidates")
      .select("*")
      .eq("is_active", true)
      .order("poll_average", { ascending: false })
      .limit(count);

    if (countryCode) query = query.eq("country_code", countryCode);

    const { data: rows, error } = await query;

    if (error || !rows) return [];

    const ids = rows.map((r) => r.id);
    const { data: polls } = await supabase
      .from("poll_data_points")
      .select("*")
      .in("candidate_id", ids)
      .order("date", { ascending: true });

    const pollsByCandidate: Record<string, PollDataPoint[]> = {};
    if (polls) {
      for (const p of polls) {
        if (!pollsByCandidate[p.candidate_id]) pollsByCandidate[p.candidate_id] = [];
        pollsByCandidate[p.candidate_id].push({
          date: p.date,
          value: p.value,
          pollster: p.pollster,
        });
      }
    }

    return rows.map((row) => mapDbToCandidate(row, pollsByCandidate[row.id] || []));
  } catch (err) {
    console.error("[fetchTopCandidates] Exception:", err);
    return [];
  }
}
