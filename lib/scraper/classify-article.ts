import { createHash } from "crypto";
import { getOpenAI } from "@/lib/ai/openai";
import { type RawArticle } from "./fetch-rss";

/** Article ready to insert into Supabase news_articles table */
export interface ClassifiedArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string;
  category: string;
  fact_check: string | null;
  candidates_mentioned: string[];
  image_url: string | null;
  is_breaking: boolean;
  is_active: boolean;
  /** Poll data extracted from encuestas articles (not stored in news_articles) */
  _poll_data?: PollDataExtracted[];
}

/** Poll data extracted from an encuesta article */
export interface PollDataExtracted {
  candidate_id: string;
  value: number;
  pollster: string;
  date: string; // YYYY-MM-DD
}

const CANDIDATE_SLUGS = [
  // Existing 8 (DB slugs)
  "rafael-lopez-aliaga",
  "keiko-fujimori",
  "cesar-acuna",
  "mario-vizcarra",
  "carlos-alvarez",
  "alfonso-lopez-chau",
  "george-forsyth",
  "jose-luna-galvez",
  // New 28 from JNE
  "alex-gonzales",
  "alfonso-espa",
  "alvaro-paz-de-la-barra",
  "antonio-ortiz",
  "armando-masse",
  "carlos-jaico",
  "charlie-carrasco",
  "fiorella-molinelli",
  "francisco-diez-canseco",
  "herbert-caller",
  "jorge-nieto",
  "jose-williams",
  "fernando-olivera",
  "marisol-perez-tello",
  "mesias-guevara",
  "napoleon-becerra",
  "paul-jaimes",
  "pitter-valderrama",
  "rafael-belaunde",
  "ricardo-belmont",
  "roberto-chiabra",
  "roberto-sanchez",
  "ronald-atencio",
  "rosario-fernandez",
  "vladimir-cerron",
  "walter-chirinos",
  "wolfgang-grozo",
  "yonhy-lescano",
];

/**
 * Mapping from classifier slug → actual DB id for candidates
 * whose DB id differs from their slug (the original 8 candidates).
 * New candidates use their slug as their DB id, so they don't need mapping.
 */
const SLUG_TO_DB_ID: Record<string, string> = {
  "rafael-lopez-aliaga": "1",
  "keiko-fujimori": "2",
  "cesar-acuna": "3",
  "mario-vizcarra": "4",
  "carlos-alvarez": "5",
  "alfonso-lopez-chau": "6",
  "george-forsyth": "7",
  "jose-luna-galvez": "8",
};

/** Convert a classifier slug to the actual DB candidate id */
function slugToDbId(slug: string): string {
  return SLUG_TO_DB_ID[slug] || slug;
}

const VALID_CATEGORIES = [
  "politica",
  "economia",
  "seguridad",
  "encuestas",
  "corrupcion",
  "opinion",
];

/**
 * Whitelist of recognized Peruvian pollsters.
 * Poll data from any other source is rejected.
 */
const VALID_POLLSTERS = new Set([
  "ipsos",
  "datum",
  "iep",
  "cpi",
  "vox populi",
  "gfk",
  "proetica",
]);

function isValidPollster(pollster: string): boolean {
  return VALID_POLLSTERS.has(pollster.toLowerCase().trim());
}

const CLASSIFICATION_PROMPT = `Eres un clasificador de noticias electorales peruanas (elecciones 2026). Analiza la siguiente noticia y responde en JSON.

CANDIDATOS PRESIDENCIALES (usa estos slugs exactos):
- rafael-lopez-aliaga (Rafael Lopez Aliaga, Renovacion Popular)
- keiko-fujimori (Keiko Fujimori, Fuerza Popular)
- cesar-acuna (Cesar Acuna, Alianza para el Progreso)
- mario-vizcarra (Mario Vizcarra, Peru Primero)
- carlos-alvarez (Carlos Alvarez, Pais para Todos)
- alfonso-lopez-chau (Alfonso Lopez Chau, Ahora Nacion)
- george-forsyth (George Forsyth, Somos Peru)
- jose-luna-galvez (Jose Luna Galvez, Podemos Peru)
- alex-gonzales (Alex Gonzales, Partido Democrata Verde)
- alfonso-espa (Alfonso Espa, Partido Sicreo)
- alvaro-paz-de-la-barra (Alvaro Paz de la Barra, Fe en el Peru)
- antonio-ortiz (Antonio Ortiz, Salvemos al Peru)
- armando-masse (Armando Masse, Partido Democratico Federal)
- carlos-jaico (Carlos Jaico, Peru Moderno)
- charlie-carrasco (Charlie Carrasco, Partido Democrata Unido Peru)
- fiorella-molinelli (Fiorella Molinelli, Fuerza y Libertad)
- francisco-diez-canseco (Francisco Diez-Canseco, Peru Accion)
- herbert-caller (Herbert Caller, Partido Patriotico del Peru)
- jorge-nieto (Jorge Nieto, Partido del Buen Gobierno)
- jose-williams (Jose Williams, Avanza Pais)
- fernando-olivera (Fernando Olivera, Frente de la Esperanza)
- marisol-perez-tello (Marisol Perez Tello, Primero la Gente)
- mesias-guevara (Mesias Guevara, Partido Morado)
- napoleon-becerra (Napoleon Becerra, PTE Peru)
- paul-jaimes (Paul Jaimes, Progresemos)
- pitter-valderrama (Pitter Valderrama, Partido Aprista Peruano / APRA)
- rafael-belaunde (Rafael Belaunde, Libertad Popular)
- ricardo-belmont (Ricardo Belmont, Partido Civico Obras)
- roberto-chiabra (Roberto Chiabra, Unidad Nacional)
- roberto-sanchez (Roberto Sanchez, Juntos por el Peru)
- ronald-atencio (Ronald Atencio, Alianza Electoral Venceremos)
- rosario-fernandez (Rosario Fernandez, Un Camino Diferente)
- vladimir-cerron (Vladimir Cerron, Peru Libre)
- walter-chirinos (Walter Chirinos, PRIN)
- wolfgang-grozo (Wolfgang Grozo, Integridad Democratica)
- yonhy-lescano (Yonhy Lescano, Cooperacion Popular)

CATEGORIAS VALIDAS: politica, economia, seguridad, encuestas, corrupcion, opinion

IMPORTANTE: Si la noticia es sobre una ENCUESTA ELECTORAL (intencion de voto, sondeo, preferencias electorales), clasifica como "encuestas" y ADEMAS extrae los porcentajes de cada candidato mencionado en el campo "poll_data".

RESPONDE EN JSON:
{
  "is_electoral_related": boolean,
  "summary": "Resumen objetivo de 1-2 oraciones en espanol",
  "category": "una de las categorias validas",
  "candidates_mentioned": ["slug1", "slug2"],
  "is_breaking": boolean,
  "fact_check": "verified" | "questionable" | null,
  "poll_data": [
    { "candidate_id": "slug", "value": 12.5, "pollster": "Nombre de la encuestadora" }
  ]
}

REGLAS para poll_data (ESTRICTAS — seguir al pie de la letra):
- SOLO extraer poll_data si la noticia reporta resultados de una ENCUESTA de intencion de voto realizada por una ENCUESTADORA RECONOCIDA
- ENCUESTADORAS VALIDAS (UNICA lista aceptada): Ipsos, Datum, IEP, CPI, Vox Populi, GfK, Proética
- Si la encuestadora mencionada NO esta en la lista anterior, poll_data = []
- Si la noticia es de un MEDIO (La Republica, RPP, El Comercio, Infobae, etc.) y NO cita una encuestadora de la lista, poll_data = []
- Un medio de comunicacion NO es una encuestadora. NUNCA usar el nombre del medio como "pollster"
- "value" es el porcentaje exacto reportado por la encuestadora (ej: 12.5, 7.3, 4.0)
- "pollster" DEBE ser una de las encuestadoras de la lista (Ipsos, Datum, IEP, CPI, Vox Populi, GfK)
- Si no puedes identificar la encuestadora, poll_data = []
- Si la noticia es opinion, analisis, columna, desmentido, o editorial, poll_data = []
- Si el titulo contiene negacion ("NO lidera", "falso que", "desmiente"), poll_data = []
- Rango: ningun candidato supera el 20% en 2026. Si el valor es mayor a 25%, poll_data = []
- Solo incluir candidatos de la lista CONOCIDA`;

/**
 * Generate a deterministic ID from a URL for deduplication.
 * Uses first 16 chars of SHA-256 hash.
 */
export function generateArticleId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

/**
 * Classify a raw article using OpenAI gpt-4o-mini.
 * Returns null if the article is not electoral-related.
 * If the article is about polls, also extracts poll data in _poll_data.
 */
export async function classifyArticle(
  raw: RawArticle
): Promise<ClassifiedArticle | null> {
  try {
    const openai = getOpenAI();

    const userMessage = `TITULO: ${raw.title}\nFUENTE: ${raw.source}\nFECHA: ${raw.pubDate}\nDESCRIPCION: ${raw.description || "(sin descripcion)"}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CLASSIFICATION_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const result = JSON.parse(content);

    // Skip non-electoral articles
    if (!result.is_electoral_related) return null;

    // Validate and sanitize (normalize to lowercase)
    const rawCategory = (result.category || "").toLowerCase();
    const category = VALID_CATEGORIES.includes(rawCategory)
      ? rawCategory
      : "politica";

    const candidatesMentioned = Array.isArray(result.candidates_mentioned)
      ? result.candidates_mentioned.filter((s: string) =>
          CANDIDATE_SLUGS.includes(s)
        )
      : [];

    // Parse the publication date
    const publishedAt = formatPublishedDate(raw.pubDate);
    const isoDate = formatISODate(raw.pubDate);

    // Extract poll data if present — STRICT: only from recognized pollsters
    let pollData: PollDataExtracted[] = [];
    if (category === "encuestas" && Array.isArray(result.poll_data)) {
      pollData = result.poll_data
        .filter(
          (p: { candidate_id?: string; value?: number; pollster?: string }) =>
            p.candidate_id &&
            CANDIDATE_SLUGS.includes(p.candidate_id) &&
            typeof p.value === "number" &&
            p.value > 0 &&
            p.value <= 25 && // No candidate exceeds 20% in 2026, 25% is hard cap
            p.pollster &&
            isValidPollster(p.pollster) // MUST be a recognized pollster
        )
        .map((p: { candidate_id: string; value: number; pollster?: string }) => ({
          candidate_id: slugToDbId(p.candidate_id),
          value: Math.round(p.value * 10) / 10, // 1 decimal
          pollster: p.pollster!, // Already validated by isValidPollster
          date: isoDate,
        }));
    }

    return {
      id: generateArticleId(raw.link),
      title: raw.title,
      summary: result.summary || raw.description || raw.title,
      source: raw.source,
      source_url: raw.link,
      published_at: publishedAt,
      category,
      fact_check:
        result.fact_check === "verified" ||
        result.fact_check === "questionable"
          ? result.fact_check
          : null,
      candidates_mentioned: candidatesMentioned,
      image_url: null,
      is_breaking: result.is_breaking === true,
      is_active: true,
      _poll_data: pollData.length > 0 ? pollData : undefined,
    };
  } catch (err) {
    console.error(`[classifyArticle] Error classifying "${raw.title}":`, err);
    return null;
  }
}

/** Convert RSS pubDate to a display-friendly format like "18 Feb 2026" */
function formatPublishedDate(pubDate: string): string {
  try {
    const date = new Date(pubDate);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}

/** Convert RSS pubDate to ISO YYYY-MM-DD for poll_data_points */
function formatISODate(pubDate: string): string {
  try {
    const date = new Date(pubDate);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}
