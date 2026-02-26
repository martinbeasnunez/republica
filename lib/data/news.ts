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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToArticle(row: any): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    sourceUrl: row.source_url || undefined,
    time: row.published_at,
    category: row.category,
    factCheck: (row.fact_check as NewsArticle["factCheck"]) || undefined,
    candidates: row.candidates_mentioned || [],
    imageUrl: row.image_url || undefined,
    isBreaking: row.is_breaking || false,
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

/** Build a text context block with all news for AI injection */
export async function fetchNewsContext(countryCode?: string): Promise<string> {
  const articles = await fetchArticles(countryCode);
  return articles
    .map(
      (a, i) =>
        `${i + 1}. "${a.title}" — ${a.source} (${a.time})${a.sourceUrl ? `\n   Link: ${a.sourceUrl}` : ""}\n   Resumen: ${a.summary}`
    )
    .join("\n\n");
}
