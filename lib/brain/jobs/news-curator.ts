import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { getOpenAI } from "@/lib/ai/openai";
import { BRAIN_PROMPTS } from "@/lib/brain/prompts";
import { logAction, logActions } from "@/lib/brain/audit";

// =============================================================================
// TYPES
// =============================================================================

interface ArticleRow {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  published_at: string;
  is_breaking: boolean;
  category: string;
}

interface TopStory {
  title: string;
  summary: string;
  source: string;
  impact_score: number;
}

export interface NewsCuratorResult {
  reviewed: number;
  set_breaking: number;
  deactivated: number;
  top_stories: TopStory[];
  errors: number;
}

interface AIScore {
  article_id: string;
  impact_score: number;
  is_breaking: boolean;
  reason: string;
}

interface AICuratorResponse {
  scores: AIScore[];
  deactivate: string[];
  top_stories: Array<{
    article_id: string;
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Max articles to send to AI per batch */
const MAX_ARTICLES_PER_BATCH = 30;

/** Impact score threshold for breaking news */
const BREAKING_THRESHOLD = 8;

/** Impact score threshold for deactivation */
const DEACTIVATE_THRESHOLD = 2;

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * News Curator Job
 *
 * Reviews recent articles, scores by electoral impact,
 * sets breaking news flags, and deactivates irrelevant content.
 * Returns top 3 stories for the briefing generator.
 */
export async function runNewsCurator(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<NewsCuratorResult> {
  const result: NewsCuratorResult = {
    reviewed: 0,
    set_breaking: 0,
    deactivated: 0,
    top_stories: [],
    errors: 0,
  };

  try {
    console.log(`[brain][news-curator][${countryCode}] Starting...`);

    // ─── 1. Fetch recent articles (last 24h) ────────────────
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: articles, error: fetchError } = await supabase
      .from("news_articles")
      .select("id, title, summary, source, published_at, is_breaking, category")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(MAX_ARTICLES_PER_BATCH);

    if (fetchError || !articles || articles.length === 0) {
      console.log(`[brain][news-curator][${countryCode}] No recent articles to review`);
      return result;
    }

    console.log(
      `[brain][news-curator][${countryCode}] Reviewing ${articles.length} articles`
    );

    // ─── 2. If too few articles, skip AI scoring ─────────────
    if (articles.length < 3) {
      console.log(
        `[brain][news-curator][${countryCode}] Too few articles (${articles.length}), skipping AI scoring`
      );
      result.reviewed = articles.length;
      result.top_stories = articles.slice(0, 3).map((a) => ({
        title: a.title,
        summary: a.summary || "",
        source: a.source,
        impact_score: 5,
      }));
      return result;
    }

    // ─── 3. Score articles with AI ──────────────────────────
    const aiResult = await scoreArticles(articles, countryCode);

    if (!aiResult) {
      console.error(`[brain][news-curator][${countryCode}] AI scoring failed`);
      result.errors++;
      // Fallback: return first 3 as top stories
      result.top_stories = articles.slice(0, 3).map((a) => ({
        title: a.title,
        summary: a.summary || "",
        source: a.source,
        impact_score: 5,
      }));
      return result;
    }

    result.reviewed = articles.length;

    // ─── 4. Process AI scores ───────────────────────────────
    const actionsToLog = [];

    // Set breaking news
    for (const score of aiResult.scores) {
      if (score.impact_score >= BREAKING_THRESHOLD && score.is_breaking) {
        const article = articles.find((a) => a.id === score.article_id);
        if (article && !article.is_breaking) {
          const { error } = await supabase
            .from("news_articles")
            .update({ is_breaking: true })
            .eq("id", score.article_id);

          if (!error) {
            result.set_breaking++;
            actionsToLog.push({
              run_id: runId,
              job: "news-curator" as const,
              action_type: "set_breaking" as const,
              entity_type: "article" as const,
              entity_id: score.article_id,
              description: `Marked as breaking (impact: ${score.impact_score}/10): ${article.title.substring(0, 80)}`,
              before_value: { is_breaking: false },
              after_value: { is_breaking: true, impact_score: score.impact_score },
              confidence: score.impact_score / 10,
              country_code: countryCode,
            });
          }
        }
      }
    }

    // Deactivate low-quality articles
    if (aiResult.deactivate && aiResult.deactivate.length > 0) {
      for (const articleId of aiResult.deactivate) {
        const article = articles.find((a) => a.id === articleId);
        if (!article) continue;

        const score = aiResult.scores.find((s) => s.article_id === articleId);
        const impactScore = score?.impact_score ?? 1;

        // Only deactivate if AI score is truly low
        if (impactScore > DEACTIVATE_THRESHOLD) continue;

        const { error } = await supabase
          .from("news_articles")
          .update({ is_active: false })
          .eq("id", articleId);

        if (!error) {
          result.deactivated++;
          actionsToLog.push({
            run_id: runId,
            job: "news-curator" as const,
            action_type: "deactivate" as const,
            entity_type: "article" as const,
            entity_id: articleId,
            description: `Deactivated low-impact article (${impactScore}/10): ${article.title.substring(0, 80)}`,
            before_value: { is_active: true },
            after_value: { is_active: false, impact_score: impactScore },
            confidence: 1 - impactScore / 10,
            country_code: countryCode,
          });
        }
      }
    }

    // Batch-log all actions
    if (actionsToLog.length > 0) {
      await logActions(supabase, actionsToLog);
    }

    // ─── 5. Set top stories ─────────────────────────────────
    result.top_stories = (aiResult.top_stories || []).slice(0, 3).map((ts) => ({
      title: ts.title,
      summary: ts.summary || "",
      source: ts.source,
      impact_score: ts.impact_score,
    }));

    // Fallback if AI didn't return top stories
    if (result.top_stories.length === 0) {
      const sorted = [...(aiResult.scores || [])]
        .sort((a, b) => b.impact_score - a.impact_score)
        .slice(0, 3);

      result.top_stories = sorted.map((s) => {
        const article = articles.find((a) => a.id === s.article_id);
        return {
          title: article?.title || "",
          summary: article?.summary || "",
          source: article?.source || "",
          impact_score: s.impact_score,
        };
      });
    }

    console.log(
      `[brain][news-curator][${countryCode}] Done: ${result.reviewed} reviewed, ${result.set_breaking} breaking, ${result.deactivated} deactivated`
    );

    return result;
  } catch (err) {
    console.error(`[brain][news-curator][${countryCode}] Fatal error:`, err);
    result.errors++;
    return result;
  }
}

// =============================================================================
// AI HELPER
// =============================================================================

/**
 * Score a batch of articles using AI.
 */
async function scoreArticles(
  articles: ArticleRow[],
  countryCode: CountryCode
): Promise<AICuratorResponse | null> {
  const openai = getOpenAI();

  const articlesList = articles
    .map(
      (a, i) =>
        `[${i}] id="${a.id}" | ${a.source} | ${a.published_at} | ${a.category}\n    "${a.title}"\n    ${a.summary?.substring(0, 150) || "Sin resumen"}`
    )
    .join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: BRAIN_PROMPTS.newsCurator(countryCode),
        },
        {
          role: "user",
          content: `Evalua estos ${articles.length} articulos:\n\n${articlesList}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AICuratorResponse;
  } catch (err) {
    console.error(`[brain][news-curator] AI error:`, err);
    return null;
  }
}
