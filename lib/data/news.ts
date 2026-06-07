import { getSupabase } from "@/lib/supabase";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  time: string;
  category: string;
  factCheck?: "verified" | "questionable" | "false";
  candidates: string[];
  imageUrl?: string;
  isBreaking?: boolean;
}

// =============================================================================
// DB ROW → NewsArticle MAPPER
// =============================================================================

const SPANISH_MONTHS: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, set: 8, oct: 9, nov: 10, dic: 11,
};

/** Parse Spanish date strings like "18 feb. 2026" into ISO format. Falls back to null. */
function parseSpanishDate(str: string): Date | null {
  if (!str) return null;
  // Try ISO first
  const iso = new Date(str);
  if (!isNaN(iso.getTime())) return iso;
  // Parse "DD mes. YYYY" or "DD de mes de YYYY"
  const m = str.match(/(\d{1,2})\s+(?:de\s+)?([a-z]{3})\.?\s+(?:de\s+)?(\d{4})/i);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = SPANISH_MONTHS[m[2].toLowerCase()];
  const year = parseInt(m[3], 10);
  if (month === undefined) return null;
  return new Date(year, month, day, 12, 0, 0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToArticle(row: any): NewsArticle {
  // Prefer the real publication date over DB insertion date.
  // This prevents old articles (found in RSS late) from showing as "breaking".
  const published = parseSpanishDate(row.published_at);
  const created = row.created_at ? new Date(row.created_at) : null;
  // Use the EARLIER of the two (real publication is always <= insertion)
  const realTime = published && created
    ? (published < created ? published : created)
    : (published || created);
  const timeIso = realTime ? realTime.toISOString() : (row.created_at || row.published_at);

  // If article is > 48h old, override is_breaking
  const isOld = realTime && (Date.now() - realTime.getTime() > 48 * 3600 * 1000);

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    sourceUrl: row.source_url || undefined,
    time: timeIso,
    category: row.category,
    factCheck: (row.fact_check as NewsArticle["factCheck"]) || undefined,
    candidates: row.candidates_mentioned || [],
    imageUrl: row.image_url || undefined,
    isBreaking: isOld ? false : (row.is_breaking || false),
  };
}

// =============================================================================
// ASYNC DATA FETCHING
// =============================================================================

/** Fetch all active news articles, most recent first */
export async function fetchArticles(countryCode?: string): Promise<NewsArticle[]> {
  try {
    const supabase = getSupabase();

    let query = supabase
      .from("news_articles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (countryCode) query = query.eq("country_code", countryCode);

    const { data, error } = await query;

    if (error) {
      console.error("[fetchArticles] Error:", error);
      return [];
    }

    return (data || []).map(mapDbToArticle);
  } catch (err) {
    console.error("[fetchArticles] Exception:", err);
    return [];
  }
}

/** Build a text context block with recent news for AI injection (limited to avoid token overflow) */
export async function fetchNewsContext(countryCode?: string, limit: number = 20): Promise<string> {
  const articles = await fetchArticles(countryCode);
  return articles
    .slice(0, limit)
    .map(
      (a, i) =>
        `${i + 1}. "${a.title}" — ${a.source} (${a.time})${a.sourceUrl ? `\n   Link: ${a.sourceUrl}` : ""}\n   Resumen: ${a.summary}`
    )
    .join("\n\n");
}
