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

interface ProfileResearchResult {
  biography: string;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    verified: boolean;
  }>;
  career: Array<{
    role: string;
    entity: string;
    startYear: number;
    endYear: number | null;
  }>;
  controversies: Array<{
    title: string;
    summary: string;
    date: string;
    sources: string[];
    severity: "alta" | "media" | "baja";
  }>;
  legal_summary: string;
  party_history: Array<{
    party: string;
    startYear: number;
    endYear: number | null;
  }>;
  previous_candidacies: number;
  years_in_politics: number;
  sources: Array<{
    url: string;
    title: string;
    date: string;
  }>;
  confidence: number;
}

export interface ProfileResearcherResult {
  researched: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Max candidates to research per run to control costs */
const MAX_CANDIDATES_PER_RUN = 3;

/** Days before a profile is considered stale and needs re-research */
const STALE_DAYS = 7;

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * Profile Researcher Job
 *
 * Compiles verifiable public profiles for candidates using news articles
 * and publicly known information. Creates or updates candidate_profiles.
 */
export async function runProfileResearcher(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<ProfileResearcherResult> {
  const result: ProfileResearcherResult = {
    researched: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    console.log(`[brain][profile-researcher][${countryCode}] Starting...`);

    // ─── 1. Fetch active candidates ─────────────────────────
    const { data: candidates, error: candError } = await supabase
      .from("candidates")
      .select(
        "id, slug, name, short_name, party, age, profession, bio, is_active, country_code"
      )
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .order("sort_order", { ascending: true });

    if (candError || !candidates || candidates.length === 0) {
      console.log(
        `[brain][profile-researcher][${countryCode}] No candidates found`
      );
      return result;
    }

    // ─── 2. Find candidates needing research ──────────────────
    const staleBefore = new Date(
      Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: existingProfiles } = await supabase
      .from("candidate_profiles")
      .select("candidate_id, last_researched_at")
      .eq("country_code", countryCode);

    const profileMap = new Map(
      (existingProfiles || []).map((p) => [
        p.candidate_id,
        p.last_researched_at,
      ])
    );

    // Prioritize: no profile yet → stale profile
    const candidatesNeedingResearch = candidates
      .filter((c) => {
        const lastResearched = profileMap.get(c.id);
        if (!lastResearched) return true; // No profile yet
        return lastResearched < staleBefore; // Stale profile
      })
      .slice(0, MAX_CANDIDATES_PER_RUN);

    if (candidatesNeedingResearch.length === 0) {
      console.log(
        `[brain][profile-researcher][${countryCode}] All profiles up to date, skipping`
      );
      return result;
    }

    console.log(
      `[brain][profile-researcher][${countryCode}] Researching ${candidatesNeedingResearch.length} candidates`
    );

    // ─── 3. Fetch recent news ──────────────────────────────────
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: recentArticles } = await supabase
      .from("news_articles")
      .select(
        "id, title, summary, source, published_at, candidates_mentioned"
      )
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(200);

    // ─── 4. Research each candidate ────────────────────────────
    for (const candidate of candidatesNeedingResearch) {
      try {
        // Find articles mentioning this candidate
        const mentioningArticles = (recentArticles || []).filter((a) => {
          const mentioned = a.candidates_mentioned || [];
          return mentioned.some(
            (m: string) =>
              m === candidate.slug ||
              m === candidate.id ||
              candidate.name.toLowerCase().includes(m.toLowerCase()) ||
              m.toLowerCase().includes(candidate.slug.toLowerCase())
          );
        });

        const profileData = await researchCandidate(
          candidate as CandidateRow,
          mentioningArticles,
          countryCode
        );

        if (!profileData) {
          console.log(
            `[brain][profile-researcher][${countryCode}] ${candidate.short_name}: AI returned no data`
          );
          result.errors++;
          continue;
        }

        result.researched++;

        // Upsert into candidate_profiles
        const isNew = !profileMap.has(candidate.id);
        const { error: upsertError } = await supabase
          .from("candidate_profiles")
          .upsert(
            {
              candidate_id: candidate.id,
              country_code: countryCode,
              biography: profileData.biography || null,
              education: profileData.education || [],
              career: profileData.career || [],
              controversies: profileData.controversies || [],
              legal_summary:
                profileData.legal_summary ||
                "Sin procesos legales de conocimiento publico.",
              party_history: profileData.party_history || [],
              previous_candidacies: profileData.previous_candidacies || 0,
              years_in_politics: profileData.years_in_politics || 0,
              sources: profileData.sources || [],
              confidence: profileData.confidence || 0,
              last_researched_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "candidate_id" }
          );

        if (upsertError) {
          console.error(
            `[brain][profile-researcher][${countryCode}] Failed to upsert ${candidate.short_name}:`,
            upsertError
          );
          result.errors++;
          continue;
        }

        if (isNew) {
          result.created++;
        } else {
          result.updated++;
        }

        // Log the action
        await logAction(supabase, {
          run_id: runId,
          job: "profile-researcher",
          action_type: isNew ? "create" : "update",
          entity_type: "candidate",
          entity_id: candidate.id,
          description: `${isNew ? "Created" : "Updated"} profile for ${candidate.short_name} (confidence: ${profileData.confidence.toFixed(2)}, ${mentioningArticles.length} articles used)`,
          confidence: profileData.confidence,
          country_code: countryCode,
        });

        console.log(
          `[brain][profile-researcher][${countryCode}] ${isNew ? "Created" : "Updated"} profile for ${candidate.short_name} (confidence: ${profileData.confidence.toFixed(2)})`
        );

        // Rate limit between candidates
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(
          `[brain][profile-researcher][${countryCode}] Error researching ${candidate.short_name}:`,
          err
        );
        result.errors++;
      }
    }

    console.log(
      `[brain][profile-researcher][${countryCode}] Done: ${result.researched} researched, ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`
    );

    return result;
  } catch (err) {
    console.error(
      `[brain][profile-researcher][${countryCode}] Fatal error:`,
      err
    );
    result.errors++;
    return result;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Use AI to compile a verifiable profile for a candidate.
 */
async function researchCandidate(
  candidate: CandidateRow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articles: any[],
  countryCode: CountryCode
): Promise<ProfileResearchResult | null> {
  const openai = getOpenAI();

  const candidateData = `CANDIDATO: ${candidate.name}
- Partido: ${candidate.party}
- Edad: ${candidate.age}
- Profesion: ${candidate.profession}
- Bio actual: ${candidate.bio}`;

  const newsData =
    articles.length > 0
      ? articles
          .slice(0, 20)
          .map(
            (a) =>
              `- [${a.published_at}] "${a.title}" (${a.source}): ${a.summary?.substring(0, 300) || "Sin resumen"}`
          )
          .join("\n")
      : "No hay noticias recientes disponibles para este candidato.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: BRAIN_PROMPTS.profileResearcher(countryCode),
        },
        {
          role: "user",
          content: `${candidateData}\n\nNOTICIAS RECIENTES:\n${newsData}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const result = JSON.parse(content);
    return result as ProfileResearchResult;
  } catch (err) {
    console.error(
      `[brain][profile-researcher] AI error for ${candidate.short_name}:`,
      err
    );
    return null;
  }
}
