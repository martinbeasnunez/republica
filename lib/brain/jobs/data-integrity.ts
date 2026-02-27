import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { getOpenAI } from "@/lib/ai/openai";
import { BRAIN_PROMPTS } from "@/lib/brain/prompts";
import { logAction } from "@/lib/brain/audit";

// =============================================================================
// TYPES
// =============================================================================

interface CandidateRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  party: string;
  age: number;
  profession: string;
  bio: string;
  is_active: boolean;
  country_code: string;
}

interface DataIntegrityIssue {
  field: string;
  current_value: string;
  suggested_value: string;
  reason: string;
  confidence: number;
  source_article: string;
}

export interface DataIntegrityResult {
  checked: number;
  updated: number;
  flagged: number;
  errors: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Max candidates to check per run to control costs */
const MAX_CANDIDATES_PER_RUN = 5;

/** Confidence threshold for auto-updating data */
const AUTO_UPDATE_THRESHOLD = 0.85;

/** Fields that can be auto-updated (NEVER include is_active — only admin can deactivate candidates) */
const UPDATABLE_FIELDS = new Set(["bio", "age", "party", "profession"]);

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * Data Integrity Job
 *
 * Verifies candidate data against recent news articles.
 * Auto-updates data when AI confidence is >= 0.85.
 * Flags potential issues when confidence is 0.5-0.84.
 */
export async function runDataIntegrity(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<DataIntegrityResult> {
  const result: DataIntegrityResult = {
    checked: 0,
    updated: 0,
    flagged: 0,
    errors: 0,
  };

  try {
    console.log(`[brain][data-integrity][${countryCode}] Starting...`);

    // ─── 1. Fetch active candidates ─────────────────────────
    const { data: candidates, error: candError } = await supabase
      .from("candidates")
      .select("id, slug, name, short_name, party, age, profession, bio, is_active, country_code")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .order("sort_order", { ascending: true });

    if (candError || !candidates || candidates.length === 0) {
      console.log(`[brain][data-integrity][${countryCode}] No candidates found`);
      return result;
    }

    // ─── 2. Fetch recent news (last 7 days) ─────────────────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentArticles } = await supabase
      .from("news_articles")
      .select("id, title, summary, source, published_at, candidates_mentioned")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!recentArticles || recentArticles.length === 0) {
      console.log(`[brain][data-integrity][${countryCode}] No recent articles, skipping`);
      return result;
    }

    // ─── 3. Find candidates mentioned in recent news ────────
    const candidatesWithNews = candidates
      .map((c) => {
        const mentioningArticles = recentArticles.filter((a) => {
          const mentioned = a.candidates_mentioned || [];
          return mentioned.some(
            (m: string) =>
              m === c.slug ||
              m === c.id ||
              c.name.toLowerCase().includes(m.toLowerCase()) ||
              m.toLowerCase().includes(c.slug.toLowerCase())
          );
        });
        return { candidate: c as CandidateRow, articles: mentioningArticles };
      })
      .filter((c) => c.articles.length > 0)
      .slice(0, MAX_CANDIDATES_PER_RUN);

    if (candidatesWithNews.length === 0) {
      console.log(
        `[brain][data-integrity][${countryCode}] No candidates with recent mentions, skipping`
      );
      return result;
    }

    console.log(
      `[brain][data-integrity][${countryCode}] Checking ${candidatesWithNews.length} candidates with recent news mentions`
    );

    // ─── 4. Check each candidate with AI ────────────────────
    for (const { candidate, articles } of candidatesWithNews) {
      try {
        const issues = await checkCandidateIntegrity(candidate, articles, countryCode);
        result.checked++;

        if (issues.length === 0) {
          console.log(
            `[brain][data-integrity][${countryCode}] ${candidate.short_name}: OK, no issues`
          );
          continue;
        }

        // Process each issue
        for (const issue of issues) {
          if (!UPDATABLE_FIELDS.has(issue.field)) continue;
          if (issue.confidence < 0.5) continue;

          if (issue.confidence >= AUTO_UPDATE_THRESHOLD) {
            // Auto-update with high confidence
            const updated = await autoUpdateCandidate(
              supabase,
              candidate,
              issue,
              runId,
              countryCode
            );
            if (updated) {
              result.updated++;
            } else {
              result.errors++;
            }
          } else {
            // Flag for review (log but don't modify)
            await logAction(supabase, {
              run_id: runId,
              job: "data-integrity",
              action_type: "flag",
              entity_type: "candidate",
              entity_id: candidate.id,
              description: `[FLAG] ${candidate.short_name}: ${issue.field} may need update — ${issue.reason}`,
              before_value: { [issue.field]: issue.current_value },
              after_value: { [issue.field]: issue.suggested_value },
              confidence: issue.confidence,
              country_code: countryCode,
            });
            result.flagged++;
          }
        }

        // Rate limit between candidates
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(
          `[brain][data-integrity][${countryCode}] Error checking ${candidate.short_name}:`,
          err
        );
        result.errors++;
      }
    }

    console.log(
      `[brain][data-integrity][${countryCode}] Done: ${result.checked} checked, ${result.updated} updated, ${result.flagged} flagged, ${result.errors} errors`
    );

    return result;
  } catch (err) {
    console.error(`[brain][data-integrity][${countryCode}] Fatal error:`, err);
    result.errors++;
    return result;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Use AI to check a candidate's data against recent news.
 */
async function checkCandidateIntegrity(
  candidate: CandidateRow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articles: any[],
  countryCode: CountryCode
): Promise<DataIntegrityIssue[]> {
  const openai = getOpenAI();

  const candidateData = `CANDIDATO: ${candidate.name}
- Bio: ${candidate.bio}
- Edad: ${candidate.age}
- Partido: ${candidate.party}
- Profesion: ${candidate.profession}`;

  const newsData = articles
    .slice(0, 15)
    .map(
      (a) =>
        `- [${a.published_at}] "${a.title}" (${a.source}): ${a.summary?.substring(0, 200) || "Sin resumen"}`
    )
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: BRAIN_PROMPTS.dataIntegrityChecker(countryCode),
        },
        {
          role: "user",
          content: `${candidateData}\n\nNOTICIAS RECIENTES QUE MENCIONAN A ESTE CANDIDATO:\n${newsData}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    const result = JSON.parse(content);
    return (result.issues || []) as DataIntegrityIssue[];
  } catch (err) {
    console.error(
      `[brain][data-integrity] AI error for ${candidate.short_name}:`,
      err
    );
    return [];
  }
}

/**
 * Auto-update a candidate field in Supabase with audit trail.
 */
async function autoUpdateCandidate(
  supabase: SupabaseClient,
  candidate: CandidateRow,
  issue: DataIntegrityIssue,
  runId: string,
  countryCode: string
): Promise<boolean> {
  const field = issue.field;

  // Build the update object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  if (field === "age") {
    const newAge = parseInt(issue.suggested_value, 10);
    if (isNaN(newAge) || newAge < 18 || newAge > 100) {
      console.log(
        `[brain][data-integrity] Invalid age suggestion for ${candidate.short_name}: ${issue.suggested_value}`
      );
      return false;
    }
    updateData.age = newAge;
  } else {
    // String fields: bio, party, profession
    if (!issue.suggested_value || issue.suggested_value.length < 3) return false;
    updateData[field] = issue.suggested_value;
  }

  try {
    const { error } = await supabase
      .from("candidates")
      .update(updateData)
      .eq("id", candidate.id);

    if (error) {
      console.error(
        `[brain][data-integrity] Failed to update ${candidate.short_name}.${field}:`,
        error
      );
      return false;
    }

    // Log the action with before/after
    await logAction(supabase, {
      run_id: runId,
      job: "data-integrity",
      action_type: "update",
      entity_type: "candidate",
      entity_id: candidate.id,
      description: `Auto-updated ${candidate.short_name}.${field}: ${issue.reason}`,
      before_value: { [field]: issue.current_value },
      after_value: { [field]: issue.suggested_value },
      confidence: issue.confidence,
      country_code: countryCode,
    });

    console.log(
      `[brain][data-integrity] Updated ${candidate.short_name}.${field} (confidence: ${issue.confidence})`
    );
    return true;
  } catch (err) {
    console.error(
      `[brain][data-integrity] Error updating ${candidate.short_name}:`,
      err
    );
    return false;
  }
}
