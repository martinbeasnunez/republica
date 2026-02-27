import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { getOpenAI } from "@/lib/ai/openai";
import { BRAIN_PROMPTS } from "@/lib/brain/prompts";
import { logAction, logBriefing } from "@/lib/brain/audit";

// =============================================================================
// TYPES
// =============================================================================

interface TopStory {
  title: string;
  summary: string;
  source: string;
  impact_score: number;
}

interface PollMovement {
  candidate: string;
  previous: number;
  current: number;
  direction: "up" | "down" | "stable";
}

interface DataIssue {
  candidate: string;
  field: string;
  issue: string;
}

export interface BriefingGeneratorResult {
  briefing_id: string | null;
  editorial_summary: string;
  skipped: boolean;
  errors: number;
}

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * Briefing Generator Job
 *
 * Creates a daily editorial briefing summarizing:
 * - Top stories from news curator
 * - Poll movements
 * - Recent fact-checks
 * - Data integrity issues
 *
 * Idempotent: only generates one briefing per country per day.
 */
export async function runBriefingGenerator(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string,
  topStories: TopStory[]
): Promise<BriefingGeneratorResult> {
  const result: BriefingGeneratorResult = {
    briefing_id: null,
    editorial_summary: "",
    skipped: false,
    errors: 0,
  };

  try {
    console.log(`[brain][briefing][${countryCode}] Starting...`);

    const todayStr = new Date().toISOString().split("T")[0];

    // ─── 1. Check if briefing already exists today ──────────
    const { data: existing } = await supabase
      .from("brain_briefings")
      .select("id, editorial_summary")
      .eq("country_code", countryCode)
      .eq("briefing_date", todayStr)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(
        `[brain][briefing][${countryCode}] Briefing already exists for ${todayStr}, skipping`
      );
      result.briefing_id = existing[0].id;
      result.editorial_summary = existing[0].editorial_summary;
      result.skipped = true;
      return result;
    }

    // ─── 2. Gather context data ─────────────────────────────

    // Poll movements: compare current vs 3 days ago
    const pollMovements = await getPollMovements(supabase, countryCode);

    // Recent fact-checks (last 24h)
    const recentFactChecks = await getRecentFactChecks(supabase, countryCode);

    // Data integrity issues flagged today
    const dataIssues = await getDataIssues(supabase, countryCode, runId);

    // ─── 3. Generate editorial briefing with AI ─────────────
    const aiResult = await generateBriefing(
      countryCode,
      topStories,
      pollMovements,
      recentFactChecks,
      dataIssues
    );

    if (!aiResult) {
      console.error(`[brain][briefing][${countryCode}] AI generation failed`);
      result.errors++;
      return result;
    }

    // ─── 4. Save briefing ───────────────────────────────────
    const briefingId = await logBriefing(supabase, {
      run_id: runId,
      country_code: countryCode,
      briefing_date: todayStr,
      top_stories: topStories,
      poll_movements: pollMovements,
      new_fact_checks: recentFactChecks.map((fc) => ({
        claim: fc.claim,
        verdict: fc.verdict,
      })),
      editorial_summary: aiResult.editorial_summary,
      data_issues: dataIssues,
      health_status: {
        last_scrape_ok: true, // TODO: check actual scrape health
        last_verify_ok: true,
        data_quality_score: 0.9,
      },
    });

    result.briefing_id = briefingId;
    result.editorial_summary = aiResult.editorial_summary;

    // Log the action
    await logAction(supabase, {
      run_id: runId,
      job: "briefing-generator",
      action_type: "create",
      entity_type: "briefing",
      entity_id: briefingId || undefined,
      description: `Generated daily briefing for ${countryCode} on ${todayStr}`,
      after_value: {
        top_stories_count: topStories.length,
        poll_movements_count: pollMovements.length,
        fact_checks_count: recentFactChecks.length,
        data_issues_count: dataIssues.length,
      },
      confidence: 1.0,
      country_code: countryCode,
    });

    console.log(
      `[brain][briefing][${countryCode}] Done: briefing ${briefingId} created`
    );

    return result;
  } catch (err) {
    console.error(`[brain][briefing][${countryCode}] Fatal error:`, err);
    result.errors++;
    return result;
  }
}

// =============================================================================
// DATA GATHERING
// =============================================================================

/**
 * Get poll movements: compare current averages vs 3 days ago.
 */
async function getPollMovements(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<PollMovement[]> {
  try {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, short_name, poll_average, poll_trend")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .order("poll_average", { ascending: false });

    if (!candidates) return [];

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const movements: PollMovement[] = [];

    for (const c of candidates) {
      if (!c.poll_average) continue;

      // Get poll value from ~3 days ago
      const { data: oldPolls } = await supabase
        .from("poll_data_points")
        .select("value")
        .eq("candidate_id", c.id)
        .lte("date", threeDaysAgo)
        .order("date", { ascending: false })
        .limit(1);

      const previous = oldPolls?.[0]?.value ?? c.poll_average;
      const current = c.poll_average;
      const diff = current - previous;

      movements.push({
        candidate: c.short_name,
        previous: Math.round(previous * 10) / 10,
        current: Math.round(current * 10) / 10,
        direction: diff > 0.3 ? "up" : diff < -0.3 ? "down" : "stable",
      });
    }

    return movements;
  } catch {
    return [];
  }
}

/**
 * Get fact-checks from the last 24 hours.
 */
async function getRecentFactChecks(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<Array<{ claim: string; verdict: string }>> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: factChecks } = await supabase
      .from("fact_checks")
      .select("claim, verdict")
      .eq("country_code", countryCode)
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    return factChecks || [];
  } catch {
    return [];
  }
}

/**
 * Get data integrity issues flagged in this run or today.
 */
async function getDataIssues(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<DataIssue[]> {
  try {
    const { data: actions } = await supabase
      .from("brain_actions")
      .select("entity_id, description, before_value, after_value")
      .eq("country_code", countryCode)
      .eq("run_id", runId)
      .eq("job", "data-integrity")
      .in("action_type", ["update", "flag"]);

    if (!actions) return [];

    return actions.map((a) => ({
      candidate: a.entity_id || "unknown",
      field: Object.keys(a.before_value || {})[0] || "unknown",
      issue: a.description,
    }));
  } catch {
    return [];
  }
}

// =============================================================================
// AI HELPER
// =============================================================================

/**
 * Generate the editorial briefing text using AI.
 */
async function generateBriefing(
  countryCode: CountryCode,
  topStories: TopStory[],
  pollMovements: PollMovement[],
  factChecks: Array<{ claim: string; verdict: string }>,
  dataIssues: DataIssue[]
): Promise<{ editorial_summary: string; key_takeaways: string[] } | null> {
  const openai = getOpenAI();

  // Build context
  const sections: string[] = [];

  if (topStories.length > 0) {
    sections.push(
      "TOP NOTICIAS DEL DIA:\n" +
        topStories
          .map(
            (s, i) =>
              `${i + 1}. [Impacto: ${s.impact_score}/10] "${s.title}" (${s.source})\n   ${s.summary}`
          )
          .join("\n")
    );
  }

  if (pollMovements.length > 0) {
    const notable = pollMovements.filter((p) => p.direction !== "stable");
    if (notable.length > 0) {
      sections.push(
        "MOVIMIENTOS EN ENCUESTAS (ultimos 3 dias):\n" +
          pollMovements
            .map(
              (p) =>
                `- ${p.candidate}: ${p.previous}% → ${p.current}% (${p.direction === "up" ? "↑ sube" : p.direction === "down" ? "↓ baja" : "→ estable"})`
            )
            .join("\n")
      );
    }
  }

  if (factChecks.length > 0) {
    sections.push(
      "VERIFICACIONES RECIENTES:\n" +
        factChecks
          .map((fc) => `- [${fc.verdict}] "${fc.claim}"`)
          .join("\n")
    );
  }

  if (dataIssues.length > 0) {
    sections.push(
      "ACTUALIZACIONES DE DATOS:\n" +
        dataIssues
          .map((d) => `- ${d.candidate}: ${d.issue}`)
          .join("\n")
    );
  }

  if (sections.length === 0) {
    return {
      editorial_summary:
        "Sin novedades electorales significativas en las ultimas horas. La plataforma se mantiene actualizada con los datos mas recientes.",
      key_takeaways: ["Sin novedades significativas"],
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: BRAIN_PROMPTS.briefingWriter(countryCode),
        },
        {
          role: "user",
          content: `Genera el briefing editorial del dia basandote en:\n\n${sections.join("\n\n")}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (err) {
    console.error(`[brain][briefing] AI error:`, err);
    return null;
  }
}
