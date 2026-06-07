// =============================================================================
// CONDOR — Multi-Country Configuration
// =============================================================================

export type CountryCode = "pe" | "co";

export interface Department {
  id: string;
  name: string;
}

export interface ElectoralBody {
  acronym: string;
  name: string;
  role: string;
}

export interface MediaSource {
  name: string;
  domain: string;
  rss?: string;
  type: "newspaper" | "tv" | "digital" | "agency" | "factcheck";
}

export interface ElectoralEvent {
  id: string;
  type: "debate" | "foro" | "entrevista";
  title: string;
  date: string;           // "2026-03-23"
  startTime: string;      // "20:00" (local time)
  endTime: string;        // "22:30"
  organizer: string;      // "JNE", "SNI", etc.
  topics?: string[];
  broadcastUrl?: string;  // YouTube, etc.
  broadcastChannels?: string[];
}

export interface CountryTheme {
  primary: string;          // Main accent color (hex)
  primaryForeground: string;
  primaryLight: string;     // Lighter shade for hover/glow
  primaryGlow: string;      // For box-shadow glows (rgba)
  gradient: string;         // CSS gradient for text-gradient
  chartColors: [string, string, string, string, string];
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  nameEn: string;
  emoji: string;
  flag: string; // ISO 3166-1 alpha-2

  // Theme / Colors
  theme: CountryTheme;

  // Election
  electionDate: string; // ISO date
  electionDateSecondRound?: string;
  /** Slugs of the two candidates that advanced to the runoff. Set once first-round results are official. */
  runoffCandidateSlugs?: [string, string];
  electionType: string;
  electionSystem: string;
  electorateSize: string;
  legislatureInfo?: string;

  // Electoral bodies
  electoralBodies: ElectoralBody[];

  // Geography
  departments: Department[];
  capital: string;
  timezone: string;

  // Locale
  locale: string;
  currency: string;
  phonePrefix: string;
  phoneRegex: RegExp;

  // Data sources
  pollsters: string[];
  mediaSources: MediaSource[];

  // AI knowledge — structured electoral process for the chat assistant
  electoralProcessGuide: string;

  // Events (debates, foros, etc.)
  events?: ElectoralEvent[];

  // Deployment
  domain: string;
}

// =============================================================================
// PERU
// =============================================================================

const PERU_DEPARTMENTS: Department[] = [
  { id: "amazonas", name: "Amazonas" },
  { id: "ancash", name: "Áncash" },
  { id: "apurimac", name: "Apurímac" },
  { id: "arequipa", name: "Arequipa" },
  { id: "ayacucho", name: "Ayacucho" },
  { id: "cajamarca", name: "Cajamarca" },
  { id: "callao", name: "Callao" },
  { id: "cusco", name: "Cusco" },
  { id: "huancavelica", name: "Huancavelica" },
  { id: "huanuco", name: "Huánuco" },
  { id: "ica", name: "Ica" },
  { id: "junin", name: "Junín" },
  { id: "la-libertad", name: "La Libertad" },
  { id: "lambayeque", name: "Lambayeque" },
  { id: "lima", name: "Lima" },
  { id: "loreto", name: "Loreto" },
  { id: "madre-de-dios", name: "Madre de Dios" },
  { id: "moquegua", name: "Moquegua" },
  { id: "pasco", name: "Pasco" },
  { id: "piura", name: "Piura" },
  { id: "puno", name: "Puno" },
  { id: "san-martin", name: "San Martín" },
  { id: "tacna", name: "Tacna" },
  { id: "tumbes", name: "Tumbes" },
  { id: "ucayali", name: "Ucayali" },
];

const PERU_CONFIG: CountryConfig = {
  code: "pe",
  name: "Perú",
  nameEn: "Peru",
  emoji: "🇵🇪",
  flag: "PE",

  // 🇵🇪 Rojo peruano — inspired by the Peruvian flag
  theme: {
    primary: "#8B1A1A",
    primaryForeground: "#ffffff",
    primaryLight: "#A52525",
    primaryGlow: "rgba(139, 26, 26, 0.15)",
    gradient: "linear-gradient(135deg, #8B1A1A 0%, #C42B2B 50%, #E84040 100%)",
    chartColors: ["#8B1A1A", "#A52525", "#10b981", "#3b82f6", "#ef4444"],
  },

  electionDate: "2026-04-12",
  electionDateSecondRound: "2026-06-07",
  runoffCandidateSlugs: ["keiko-fujimori", "roberto-sanchez"],
  electionType: "Presidencial + Congreso",
  electionSystem: "Primera vuelta (si nadie supera 50%, hay segunda vuelta)",
  electorateSize: "~25.3 millones de electores habilitados",
  legislatureInfo: "Retorno al bicameralismo: 60 senadores + 130 diputados = 190 congresistas",

  electoralBodies: [
    { acronym: "JNE", name: "Jurado Nacional de Elecciones", role: "Fiscaliza y administra justicia electoral" },
    { acronym: "ONPE", name: "Oficina Nacional de Procesos Electorales", role: "Organiza y ejecuta los procesos electorales" },
    { acronym: "RENIEC", name: "Registro Nacional de Identificación y Estado Civil", role: "Padrón electoral e identificación" },
  ],

  departments: PERU_DEPARTMENTS,
  capital: "Lima",
  timezone: "America/Lima",

  locale: "es_PE",
  currency: "PEN",
  phonePrefix: "+51",
  phoneRegex: /^\+?51?\d{9}$/,

  // Encuestadoras verificadas publicando encuestas presidenciales PE 2026
  // Fuente: JNE Registro Electoral de Encuestadoras + publicaciones activas
  pollsters: ["Ipsos", "Datum", "IEP", "CPI"],

  mediaSources: [
    { name: "El Comercio", domain: "elcomercio.pe", rss: "https://elcomercio.pe/arcio/rss/", type: "newspaper" },
    { name: "La República", domain: "larepublica.pe", type: "newspaper" },
    { name: "RPP", domain: "rpp.pe", rss: "https://rpp.pe/feed", type: "digital" },
    { name: "Gestión", domain: "gestion.pe", rss: "https://gestion.pe/arcio/rss/", type: "newspaper" },
    { name: "Infobae Perú", domain: "infobae.com", type: "digital" },
    { name: "Agencia Andina", domain: "andina.pe", type: "agency" },
    { name: "Ojo Público", domain: "ojo-publico.com", type: "factcheck" },
    { name: "Convoca", domain: "convoca.pe", type: "factcheck" },
    { name: "IDL Reporteros", domain: "idl-reporteros.pe", type: "factcheck" },
  ],

  electoralProcessGuide: `PROCESO ELECTORAL PERÚ 2026:
- ELECCIONES GENERALES: 12 de abril 2026 (primera vuelta presidencial + Congreso).
- SEGUNDA VUELTA: Si ningún candidato supera el 50%, hay balotaje en junio 2026.
- ELECCIONES INTERNAS: Los partidos realizaron elecciones internas para elegir a sus candidatos. Cada partido define si usa votación de militantes, delegados o un mecanismo mixto.
- NO HAY SISTEMA DE CONSULTAS ABIERTAS como en Colombia. En Perú, los candidatos se definen dentro de cada partido por decisión interna.
- INSCRIPCIÓN: Los candidatos se inscriben ante el JNE. El JNE revisa requisitos, tachas y exclusiones.
- VOTO PREFERENCIAL: Para el Congreso se usa voto preferencial — el elector puede marcar hasta 2 candidatos dentro de la lista de su partido.
- VOTO OBLIGATORIO: El voto es obligatorio para ciudadanos de 18 a 70 años.
- FRANJA ELECTORAL: Espacio gratuito en TV y radio para candidatos, regulado por la ONPE.
- FINANCIAMIENTO: Regulado por la ONPE. Hay límites de gasto y obligación de reportar aportes.`,

  events: [
    { id: "debate-jne-1", type: "debate", title: "Debate Presidencial JNE — Fecha 1", date: "2026-03-23", startTime: "20:00", endTime: "22:30", organizer: "JNE", topics: ["Seguridad ciudadana", "Lucha contra el crimen"], broadcastUrl: "https://www.youtube.com/live/JNE", broadcastChannels: ["TV Perú", "JNE Media", "Movistar 552"] },
    { id: "debate-jne-2", type: "debate", title: "Debate Presidencial JNE — Fecha 2", date: "2026-03-24", startTime: "20:00", endTime: "22:30", organizer: "JNE", topics: ["Integridad pública", "Lucha contra la corrupción"], broadcastUrl: "https://www.youtube.com/live/JNE", broadcastChannels: ["TV Perú", "JNE Media", "Movistar 552"] },
    { id: "debate-jne-3", type: "debate", title: "Debate Presidencial JNE — Fecha 3", date: "2026-03-25", startTime: "20:00", endTime: "22:30", organizer: "JNE", topics: ["Seguridad ciudadana", "Anticorrupción"], broadcastUrl: "https://www.youtube.com/live/JNE", broadcastChannels: ["TV Perú", "JNE Media", "Movistar 552"] },
    { id: "debate-jne-4", type: "debate", title: "Debate Presidencial JNE — Fecha 4", date: "2026-03-30", startTime: "20:00", endTime: "22:30", organizer: "JNE", broadcastUrl: "https://www.youtube.com/live/JNE", broadcastChannels: ["TV Perú", "JNE Media", "Movistar 552"] },
    { id: "debate-jne-5", type: "debate", title: "Debate Presidencial JNE — Fecha 5", date: "2026-03-31", startTime: "20:00", endTime: "22:30", organizer: "JNE", broadcastUrl: "https://www.youtube.com/live/JNE", broadcastChannels: ["TV Perú", "JNE Media", "Movistar 552"] },
    { id: "debate-jne-6", type: "debate", title: "Debate Presidencial JNE — Fecha 6", date: "2026-04-01", startTime: "20:00", endTime: "22:30", organizer: "JNE", broadcastUrl: "https://www.youtube.com/live/JNE", broadcastChannels: ["TV Perú", "JNE Media", "Movistar 552"] },
  ],

  domain: "www.condorlatam.com",
};

// =============================================================================
// COLOMBIA
// =============================================================================

const COLOMBIA_DEPARTMENTS: Department[] = [
  { id: "amazonas", name: "Amazonas" },
  { id: "antioquia", name: "Antioquia" },
  { id: "arauca", name: "Arauca" },
  { id: "atlantico", name: "Atlántico" },
  { id: "bogota", name: "Bogotá D.C." },
  { id: "bolivar", name: "Bolívar" },
  { id: "boyaca", name: "Boyacá" },
  { id: "caldas", name: "Caldas" },
  { id: "caqueta", name: "Caquetá" },
  { id: "casanare", name: "Casanare" },
  { id: "cauca", name: "Cauca" },
  { id: "cesar", name: "Cesar" },
  { id: "choco", name: "Chocó" },
  { id: "cordoba", name: "Córdoba" },
  { id: "cundinamarca", name: "Cundinamarca" },
  { id: "guainia", name: "Guainía" },
  { id: "guaviare", name: "Guaviare" },
  { id: "huila", name: "Huila" },
  { id: "la-guajira", name: "La Guajira" },
  { id: "magdalena", name: "Magdalena" },
  { id: "meta", name: "Meta" },
  { id: "narino", name: "Nariño" },
  { id: "norte-de-santander", name: "Norte de Santander" },
  { id: "putumayo", name: "Putumayo" },
  { id: "quindio", name: "Quindío" },
  { id: "risaralda", name: "Risaralda" },
  { id: "san-andres", name: "San Andrés y Providencia" },
  { id: "santander", name: "Santander" },
  { id: "sucre", name: "Sucre" },
  { id: "tolima", name: "Tolima" },
  { id: "valle-del-cauca", name: "Valle del Cauca" },
  { id: "vaupes", name: "Vaupés" },
  { id: "vichada", name: "Vichada" },
];

const COLOMBIA_CONFIG: CountryConfig = {
  code: "co",
  name: "Colombia",
  nameEn: "Colombia",
  emoji: "🇨🇴",
  flag: "CO",

  // 🇨🇴 Amarillo + Azul — inspired by the Colombian flag / selección
  theme: {
    primary: "#003893",
    primaryForeground: "#ffffff",
    primaryLight: "#1a56b8",
    primaryGlow: "rgba(0, 56, 147, 0.15)",
    gradient: "linear-gradient(135deg, #003893 0%, #FCD116 50%, #CE1126 100%)",
    chartColors: ["#003893", "#FCD116", "#CE1126", "#10b981", "#3b82f6"],
  },

  electionDate: "2026-05-31",
  electionDateSecondRound: "2026-06-21",
  // Finalistas de la primera vuelta (31 may) que disputan el balotaje del 21 jun.
  // Activa la home head-to-head (RunoffHomeClient) vía isInRunoffPhase().
  runoffCandidateSlugs: ["ivan-cepeda", "abelardo-de-la-espriella"],
  electionType: "Presidencial",
  electionSystem: "Primera vuelta (si nadie supera 50%, hay segunda vuelta en 3 semanas)",
  electorateSize: "~39 millones de electores habilitados",
  legislatureInfo: "Congreso bicameral: 108 senadores + 188 representantes",

  electoralBodies: [
    { acronym: "CNE", name: "Consejo Nacional Electoral", role: "Regulación y vigilancia electoral" },
    { acronym: "RNEC", name: "Registraduría Nacional del Estado Civil", role: "Organiza elecciones y registro civil" },
    { acronym: "MOE", name: "Misión de Observación Electoral", role: "Observación y transparencia electoral" },
  ],

  departments: COLOMBIA_DEPARTMENTS,
  capital: "Bogotá",
  timezone: "America/Bogota",

  locale: "es_CO",
  currency: "COP",
  phonePrefix: "+57",
  phoneRegex: /^\+?57?\d{10}$/,

  // Encuestadoras verificadas publicando encuestas presidenciales CO 2026
  // Fuente: CNE Registro de Firmas Encuestadoras + publicaciones activas
  pollsters: ["Invamer", "CNC", "Guarumo", "Datexco", "AtlasIntel"],

  mediaSources: [
    { name: "El Tiempo", domain: "eltiempo.com", rss: "https://www.eltiempo.com/rss/politica.xml", type: "newspaper" },
    { name: "El Espectador", domain: "elespectador.com", type: "newspaper" },
    { name: "Semana", domain: "semana.com", rss: "https://www.semana.com/arc/outboundfeeds/rss/category/politica/?outputType=xml", type: "digital" },
    { name: "Infobae", domain: "infobae.com", rss: "https://www.infobae.com/arc/outboundfeeds/rss/category/colombia/?outputType=xml", type: "digital" },
    { name: "Caracol Radio", domain: "caracol.com.co", type: "tv" },
    { name: "RCN Radio", domain: "rcnradio.com", type: "tv" },
    { name: "Blu Radio", domain: "bluradio.com", type: "digital" },
    { name: "La Silla Vacía", domain: "lasillavacia.com", rss: "https://www.lasillavacia.com/feed", type: "factcheck" },
    { name: "Colombiacheck", domain: "colombiacheck.com", type: "factcheck" },
    { name: "Razón Pública", domain: "razonpublica.com", type: "digital" },
  ],

  electoralProcessGuide: `PROCESO ELECTORAL COLOMBIA 2026:
- CONSULTAS (PRIMARIAS): Mecanismo por el cual coaliciones o partidos definen su candidato presidencial mediante voto popular abierto. Cualquier ciudadano puede votar en UNA consulta el día de las legislativas. Cada consulta es INDEPENDIENTE — los candidatos de una consulta NO compiten contra los de otra. Solo compiten entre sí dentro de su propia consulta.
- FECHA DE CONSULTAS: 8 de marzo 2026 (mismo día de elecciones legislativas al Congreso).
- CONSULTAS CONFIRMADAS 2026:
  • "GRAN CONSULTA POR COLOMBIA" (centro-derecha): Es la MÁS GRANDE por cantidad de partidos y votantes esperados. Reúne a Partido Conservador, Cambio Radical, y otros. Candidatos: Vicky Dávila, David Barguil, Juan Daniel Oviedo, Paloma Valencia, entre otros. Se estima que tendrá más del doble de votos que las demás consultas.
  • "CONSULTA PACTO HISTÓRICO" (izquierda/progresismo): Coalición de gobierno. Candidatos: Iván Cepeda, Alexander López, y otros. Compiten SOLO entre ellos.
  • "CONSULTA IMPARABLES" (Claudia López): Claudia López compite en su propia consulta con candidatos menores/poco conocidos. Por la diferencia de perfil, se proyecta como amplia favorita en esta consulta específica.
  • "CONSULTA FUERZA DE LA PAZ": Roy Barreras y aliados. Consulta propia separada.
  • SIN CONSULTA (aval directo o firmas): Sergio Fajardo (Dignidad y Compromiso), Daniel Quintero (AICO), Abelardo de la Espriella, y otros van directo a primera vuelta sin pasar por consulta.
- REGLA CLAVE: Los ganadores de CADA consulta + los candidatos sin consulta se enfrentan en PRIMERA VUELTA. No se mezclan antes.
- PRIMERA VUELTA: 31 de mayo 2026. Compiten los ganadores de cada consulta + candidatos por aval/firmas.
- SEGUNDA VUELTA: 21 de junio 2026. Solo si ningún candidato supera 50% + 1 en primera vuelta.
- ELECCIONES LEGISLATIVAS: 8 de marzo 2026. Se elige Senado (108) y Cámara de Representantes (188).
- UMBRAL ELECTORAL: Un partido necesita mínimo 3% de votos al Senado para mantener personería jurídica.
- VOTO NO OBLIGATORIO: En Colombia el voto es voluntario (a diferencia de Perú).
- CNE: Vigila partidos y campañas. RNEC (Registraduría): Organiza las elecciones, emite cédulas, certifica resultados.
- FINANCIAMIENTO: El Estado financia parcialmente las campañas (reposición de votos). Hay topes de gasto.
- ENCUESTAS: Deben ser publicadas con ficha técnica completa. Prohibida su publicación 7 días antes de la elección (ley de "veda de encuestas").`,

  events: [
    {
      id: "co-primera-vuelta",
      type: "debate",
      title: "Día E — Primera Vuelta Presidencial Colombia 2026",
      date: "2026-05-31",
      startTime: "08:00",
      endTime: "16:00",
      organizer: "Registraduría Nacional",
      topics: ["Elección Presidencial"],
      broadcastChannels: ["Canal Uno", "Caracol TV", "RCN", "Señal Colombia"],
    },
    {
      id: "co-segunda-vuelta",
      type: "debate",
      title: "Día E — Segunda Vuelta Presidencial Colombia 2026",
      date: "2026-06-21",
      startTime: "08:00",
      endTime: "16:00",
      organizer: "Registraduría Nacional",
      topics: ["Balotaje Presidencial"],
      broadcastChannels: ["Canal Uno", "Caracol TV", "RCN", "Señal Colombia"],
    },
  ],

  domain: "www.condorlatam.com",
};

// =============================================================================
// REGISTRY
// =============================================================================

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  pe: PERU_CONFIG,
  co: COLOMBIA_CONFIG,
};

export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

export const DEFAULT_COUNTRY: CountryCode = "pe";

export function getCountryConfig(code: string): CountryConfig | null {
  return COUNTRIES[code as CountryCode] ?? null;
}

export function isValidCountry(code: string): code is CountryCode {
  return code in COUNTRIES;
}

export function getElectionCountdown(code: CountryCode): number {
  const config = COUNTRIES[code];
  const electionDate = new Date(config.electionDate + "T08:00:00");
  const now = new Date();
  const diff = electionDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/** Days until the second round (runoff). Returns null if no runoff date or already past. */
export function getRunoffCountdown(code: CountryCode): number | null {
  const config = COUNTRIES[code];
  if (!config.electionDateSecondRound) return null;
  const runoffDate = new Date(config.electionDateSecondRound + "T08:00:00");
  const now = new Date();
  const diff = runoffDate.getTime() - now.getTime();
  if (diff <= 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * True when we are between the first round (D+1) and the runoff (D-1) for a country
 * that has confirmed runoff candidates. Used to decide whether the home page should
 * be a runoff-focused matchup.
 */
export function isInRunoffPhase(code: CountryCode): boolean {
  const config = COUNTRIES[code];
  if (!config.runoffCandidateSlugs || !config.electionDateSecondRound) return false;
  const tz = config.timezone;
  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const firstRound = new Date(config.electionDate + "T12:00:00");
  const runoff = new Date(config.electionDateSecondRound + "T12:00:00");
  const todayObj = new Date(todayLocal + "T12:00:00");
  // After first round day, strictly before runoff day
  return todayObj.getTime() > firstRound.getTime() && todayObj.getTime() < runoff.getTime();
}

// ── Event helpers ──────────────────────────────────────────────────────────

function eventToDateRange(event: ElectoralEvent, tz: string) {
  // Build local datetime strings and convert using timezone
  const startStr = `${event.date}T${event.startTime}:00`;
  const endStr = `${event.date}T${event.endTime}:00`;
  // For server-side, use simple offset approach (Peru = UTC-5, Colombia = UTC-5)
  const offsetHours = tz === "America/Lima" ? 5 : tz === "America/Bogota" ? 5 : 5;
  const start = new Date(new Date(startStr).getTime() + offsetHours * 60 * 60 * 1000);
  const end = new Date(new Date(endStr).getTime() + offsetHours * 60 * 60 * 1000);
  return { start, end };
}

/** Event happening RIGHT NOW */
export function getActiveEvent(code: CountryCode): ElectoralEvent | null {
  const config = COUNTRIES[code];
  if (!config.events?.length) return null;
  const now = new Date();
  for (const event of config.events) {
    const { start, end } = eventToDateRange(event, config.timezone);
    if (now >= start && now <= end) return event;
  }
  return null;
}

/** Next upcoming event (within 7 days) */
export function getNextEvent(code: CountryCode): ElectoralEvent | null {
  const config = COUNTRIES[code];
  if (!config.events?.length) return null;
  const now = new Date();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  let closest: ElectoralEvent | null = null;
  let closestDiff = Infinity;
  for (const event of config.events) {
    const { start } = eventToDateRange(event, config.timezone);
    const diff = start.getTime() - now.getTime();
    if (diff > 0 && diff < sevenDays && diff < closestDiff) {
      closest = event;
      closestDiff = diff;
    }
  }
  return closest;
}

/** Event that ended in the last 24h (for post-event banners) */
export function getRecentEvent(code: CountryCode): ElectoralEvent | null {
  const config = COUNTRIES[code];
  if (!config.events?.length) return null;
  const now = new Date();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  for (const event of config.events) {
    const { end } = eventToDateRange(event, config.timezone);
    const diff = now.getTime() - end.getTime();
    if (diff > 0 && diff < twentyFourHours) return event;
  }
  return null;
}

/** All future events for a country */
export function getUpcomingEvents(code: CountryCode): ElectoralEvent[] {
  const config = COUNTRIES[code];
  if (!config.events?.length) return [];
  const now = new Date();
  return config.events.filter((event) => {
    const { end } = eventToDateRange(event, config.timezone);
    return end.getTime() > now.getTime();
  });
}
