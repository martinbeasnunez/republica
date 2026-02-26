import { createHash } from "crypto";
import { getOpenAI } from "@/lib/ai/openai";
import { type RawArticle } from "./fetch-rss";
import { getSupabase } from "@/lib/supabase";
import { getCountryConfig, type CountryCode } from "@/lib/config/countries";

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
  country_code: string;
  /** Poll data extracted from encuestas articles (not stored in news_articles) */
  _poll_data?: PollDataExtracted[];
}

/** Poll data extracted from an encuesta article */
export interface PollDataExtracted {
  candidate_id: string;
  value: number;
  pollster: string;
  date: string; // YYYY-MM-DD
  country_code: string;
}

// =============================================================================
// CANDIDATE CACHE (fetched from DB on first use per country)
// =============================================================================

interface CandidateInfo {
  id: string;
  slug: string;
  name: string;
  party: string;
}

const candidateCache: Record<string, CandidateInfo[]> = {};

async function getCandidatesForCountry(countryCode: CountryCode): Promise<CandidateInfo[]> {
  if (candidateCache[countryCode]) return candidateCache[countryCode];

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("candidates")
      .select("id, slug, name, party")
      .eq("country_code", countryCode)
      .eq("is_active", true);

    if (error || !data) {
      console.error(`[classify] Failed to fetch candidates for ${countryCode}:`, error);
      return [];
    }

    candidateCache[countryCode] = data;
    return data;
  } catch (err) {
    console.error(`[classify] Error fetching candidates for ${countryCode}:`, err);
    return [];
  }
}

/** Clear cached candidates (useful for tests or when new candidates are seeded) */
export function clearCandidateCache() {
  for (const key of Object.keys(candidateCache)) {
    delete candidateCache[key];
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

const VALID_CATEGORIES = [
  "politica",
  "economia",
  "seguridad",
  "encuestas",
  "corrupcion",
  "opinion",
];

/**
 * Build the classification prompt dynamically based on country.
 */
function buildClassificationPrompt(
  countryCode: CountryCode,
  candidates: CandidateInfo[],
): string {
  const config = getCountryConfig(countryCode);
  const countryName = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const pollsters = config?.pollsters ?? ["Ipsos", "Datum", "IEP", "CPI"];
  const electoralBodies = config?.electoralBodies.map(b => b.acronym).join(", ") ?? "JNE, ONPE";

  const candidateList = candidates
    .map((c) => `- ${c.slug} (${c.name}, ${c.party})`)
    .join("\n");

  const pollsterList = pollsters.join(", ");
  const mediaExamples = config?.mediaSources.slice(0, 4).map(s => s.name).join(", ") ?? "";

  return `Eres un clasificador de noticias electorales de ${countryName} (elecciones ${year}). Analiza la siguiente noticia y responde en JSON.

CANDIDATOS PRESIDENCIALES (usa estos slugs exactos):
${candidateList}

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
- ENCUESTADORAS VALIDAS (UNICA lista aceptada): ${pollsterList}
- Si la encuestadora mencionada NO esta en la lista anterior, poll_data = []
- Si la noticia es de un MEDIO (${mediaExamples}, etc.) y NO cita una encuestadora de la lista, poll_data = []
- Un medio de comunicacion NO es una encuestadora. NUNCA usar el nombre del medio como "pollster"
- "value" es el porcentaje exacto reportado por la encuestadora (ej: 12.5, 7.3, 4.0)
- "pollster" DEBE ser una de las encuestadoras de la lista (${pollsterList})
- Si no puedes identificar la encuestadora, poll_data = []
- Si la noticia es opinion, analisis, columna, desmentido, o editorial, poll_data = []
- Si el titulo contiene negacion ("NO lidera", "falso que", "desmiente"), poll_data = []
- Rango: ningun candidato supera el 25%. Si el valor es mayor a 30%, poll_data = []
- Solo incluir candidatos de la lista CONOCIDA
- CONTEXTO ELECTORAL: Organismos electorales son ${electoralBodies}`;
}

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
  raw: RawArticle,
  countryCode: CountryCode = "pe"
): Promise<ClassifiedArticle | null> {
  try {
    const openai = getOpenAI();
    const config = getCountryConfig(countryCode);
    const candidates = await getCandidatesForCountry(countryCode);

    if (candidates.length === 0) {
      console.warn(`[classifyArticle] No candidates found for ${countryCode}, skipping`);
      return null;
    }

    const validSlugs = candidates.map((c) => c.slug);
    const slugToId: Record<string, string> = {};
    for (const c of candidates) {
      slugToId[c.slug] = c.id;
    }

    // Build valid pollsters set from country config
    const validPollsters = new Set(
      (config?.pollsters ?? []).map((p) => p.toLowerCase().trim())
    );

    const prompt = buildClassificationPrompt(countryCode, candidates);
    const userMessage = `TITULO: ${raw.title}\nFUENTE: ${raw.source}\nFECHA: ${raw.pubDate}\nDESCRIPCION: ${raw.description || "(sin descripcion)"}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt },
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
          validSlugs.includes(s)
        )
      : [];

    // Parse the publication date
    const locale = config?.locale === "es_CO" ? "es-CO" : "es-PE";
    const publishedAt = formatPublishedDate(raw.pubDate, locale);
    const isoDate = formatISODate(raw.pubDate);

    // Extract poll data if present — STRICT: only from recognized pollsters
    let pollData: PollDataExtracted[] = [];
    if (category === "encuestas" && Array.isArray(result.poll_data)) {
      pollData = result.poll_data
        .filter(
          (p: { candidate_id?: string; value?: number; pollster?: string }) =>
            p.candidate_id &&
            validSlugs.includes(p.candidate_id) &&
            typeof p.value === "number" &&
            p.value > 0 &&
            p.value <= 30 && // Hard cap
            p.pollster &&
            validPollsters.has(p.pollster.toLowerCase().trim())
        )
        .map((p: { candidate_id: string; value: number; pollster?: string }) => ({
          candidate_id: slugToId[p.candidate_id] || p.candidate_id,
          value: Math.round(p.value * 10) / 10, // 1 decimal
          pollster: p.pollster!,
          date: isoDate,
          country_code: countryCode,
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
      country_code: countryCode,
      _poll_data: pollData.length > 0 ? pollData : undefined,
    };
  } catch (err) {
    console.error(`[classifyArticle] Error classifying "${raw.title}":`, err);
    return null;
  }
}

/** Convert RSS pubDate to a display-friendly format like "18 Feb 2026" */
function formatPublishedDate(pubDate: string, locale = "es-PE"): string {
  try {
    const date = new Date(pubDate);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString(locale, {
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
