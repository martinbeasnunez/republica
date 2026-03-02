import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { getOpenAI } from "@/lib/ai/openai";
import { BRAIN_PROMPTS } from "@/lib/brain/prompts";
import { logAction, logActions } from "@/lib/brain/audit";
import type { BriefingGeneratorResult } from "./briefing-generator";
import type { NewsCuratorResult } from "./news-curator";
import type { HealthMonitorResult } from "./health-monitor";
import type { HomepageComposerAIResponse } from "@/lib/types/homepage-blocks";

// =============================================================================
// TYPES
// =============================================================================

export interface HomepageComposerResult {
  blocks_created: number;
  blocks_deactivated: number;
  skipped: boolean;
  errors: number;
}

interface HomepageComposerContext {
  briefing: BriefingGeneratorResult;
  curation: NewsCuratorResult;
  health: HealthMonitorResult;
}

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * Homepage Composer Job
 *
 * AI-powered "product editor" that decides which dynamic blocks to show
 * on the homepage. Analyzes today's data, considers yesterday's engagement,
 * and generates 3-6 blocks for maximum user value.
 *
 * Idempotent: only generates blocks once per day per country.
 * Cost: ~$0.003 per run (1 call to gpt-4o-mini).
 */
export async function runHomepageComposer(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string,
  context: HomepageComposerContext
): Promise<HomepageComposerResult> {
  const result: HomepageComposerResult = {
    blocks_created: 0,
    blocks_deactivated: 0,
    skipped: false,
    errors: 0,
  };

  try {
    console.log(`[brain][homepage-composer][${countryCode}] Starting...`);

    // ─── 1. Idempotency: check if blocks already exist for today ──
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: existingBlocks } = await supabase
      .from("homepage_blocks")
      .select("id")
      .eq("country_code", countryCode)
      .eq("is_active", true)
      .gte("created_at", todayStart.toISOString())
      .limit(1);

    if (existingBlocks && existingBlocks.length > 0) {
      console.log(
        `[brain][homepage-composer][${countryCode}] Blocks already exist for today, skipping`
      );
      result.skipped = true;
      return result;
    }

    // ─── 2. Gather yesterday's engagement data ──────────────────
    const yesterdayEngagement = await getYesterdayEngagement(
      supabase,
      countryCode
    );

    // ─── 3. Gather context from today's data ────────────────────
    const briefingData = await getTodayBriefing(supabase, countryCode);
    const factChecks = await getRecentFactChecks(supabase, countryCode);
    const topCandidates = await getTopCandidates(supabase, countryCode);

    // ─── 4. AI call to compose blocks ───────────────────────────
    const aiResponse = await composeBlocks(
      countryCode,
      briefingData,
      factChecks,
      topCandidates,
      yesterdayEngagement
    );

    if (!aiResponse || !aiResponse.blocks || aiResponse.blocks.length === 0) {
      console.log(
        `[brain][homepage-composer][${countryCode}] AI returned no blocks`
      );
      result.errors++;
      return result;
    }

    // ─── 5. Soft-delete old active blocks ───────────────────────
    const { data: oldBlocks } = await supabase
      .from("homepage_blocks")
      .select("id")
      .eq("country_code", countryCode)
      .eq("is_active", true);

    if (oldBlocks && oldBlocks.length > 0) {
      const { error: deactivateErr } = await supabase
        .from("homepage_blocks")
        .update({ is_active: false, deactivated_at: new Date().toISOString() })
        .eq("country_code", countryCode)
        .eq("is_active", true);

      if (deactivateErr) {
        console.error(
          `[brain][homepage-composer][${countryCode}] Deactivation error:`,
          deactivateErr
        );
      } else {
        result.blocks_deactivated = oldBlocks.length;
      }
    }

    // ─── 6. Insert new blocks ───────────────────────────────────
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const newBlocks = aiResponse.blocks.map((block) => ({
      country_code: countryCode,
      run_id: runId,
      block_type: block.block_type,
      position: block.position,
      title: block.title,
      subtitle: block.subtitle || null,
      content: block.content || {},
      click_count: 0,
      impression_count: 0,
      is_active: true,
      expires_at: expiresAt,
    }));

    const { error: insertErr } = await supabase
      .from("homepage_blocks")
      .insert(newBlocks);

    if (insertErr) {
      console.error(
        `[brain][homepage-composer][${countryCode}] Insert error:`,
        insertErr
      );
      result.errors++;
      return result;
    }

    result.blocks_created = newBlocks.length;

    // ─── 7. Audit log ───────────────────────────────────────────

    // Log the composition action with reasoning
    await logAction(supabase, {
      run_id: runId,
      job: "homepage-composer",
      action_type: "compose",
      entity_type: "homepage_block",
      description: `Homepage composition: ${newBlocks.length} bloques generados`,
      before_value: yesterdayEngagement
        ? {
            clicks_total: yesterdayEngagement.clicks_total,
            top_block_type: yesterdayEngagement.top_block_type,
          }
        : undefined,
      after_value: {
        reasoning: aiResponse.reasoning,
        blocks_count: newBlocks.length,
        block_types: newBlocks.map((b) => b.block_type),
      },
      confidence: 0.9,
      country_code: countryCode,
    });

    // Log individual block creates
    const blockActions = newBlocks.map((block) => ({
      run_id: runId,
      job: "homepage-composer" as const,
      action_type: "create" as const,
      entity_type: "homepage_block" as const,
      description: `Bloque ${block.block_type}: ${block.title}`,
      after_value: { block_type: block.block_type, position: block.position },
      confidence: 0.9,
      country_code: countryCode,
    }));

    await logActions(supabase, blockActions);

    // Log deactivation if any
    if (result.blocks_deactivated > 0) {
      await logAction(supabase, {
        run_id: runId,
        job: "homepage-composer",
        action_type: "deactivate",
        entity_type: "homepage_block",
        description: `Desactivados ${result.blocks_deactivated} bloques anteriores`,
        confidence: 1.0,
        country_code: countryCode,
      });
    }

    console.log(
      `[brain][homepage-composer][${countryCode}] Done: ${result.blocks_created} created, ${result.blocks_deactivated} deactivated`
    );

    return result;
  } catch (err) {
    console.error(
      `[brain][homepage-composer][${countryCode}] Fatal error:`,
      err
    );
    result.errors++;
    return result;
  }
}

// =============================================================================
// DATA GATHERING
// =============================================================================

interface YesterdayEngagement {
  clicks_total: number;
  top_block_type: string | null;
  blocks: Array<{
    block_type: string;
    title: string;
    click_count: number;
  }>;
}

async function getYesterdayEngagement(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<YesterdayEngagement | null> {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const { data } = await supabase
      .from("homepage_blocks")
      .select("block_type, title, click_count")
      .eq("country_code", countryCode)
      .gte("created_at", twoDaysAgo.toISOString())
      .lte("created_at", yesterday.toISOString())
      .order("click_count", { ascending: false });

    if (!data || data.length === 0) return null;

    const clicksTotal = data.reduce(
      (sum, b) => sum + (b.click_count || 0),
      0
    );

    return {
      clicks_total: clicksTotal,
      top_block_type: data[0]?.block_type || null,
      blocks: data.map((b) => ({
        block_type: b.block_type,
        title: b.title,
        click_count: b.click_count || 0,
      })),
    };
  } catch {
    return null;
  }
}

interface BriefingContext {
  editorial_summary: string;
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
  poll_movements: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: string;
  }>;
}

async function getTodayBriefing(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<BriefingContext | null> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("brain_briefings")
      .select(
        "editorial_summary, top_stories, poll_movements"
      )
      .eq("country_code", countryCode)
      .eq("briefing_date", todayStr)
      .limit(1);

    if (!data || data.length === 0) {
      // Fallback: get most recent briefing
      const { data: recent } = await supabase
        .from("brain_briefings")
        .select("editorial_summary, top_stories, poll_movements")
        .eq("country_code", countryCode)
        .order("briefing_date", { ascending: false })
        .limit(1);

      if (!recent || recent.length === 0) return null;
      return recent[0] as BriefingContext;
    }

    return data[0] as BriefingContext;
  } catch {
    return null;
  }
}

async function getRecentFactChecks(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<
  Array<{ claim: string; verdict: string; claimant: string | null }>
> {
  try {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data } = await supabase
      .from("fact_checks")
      .select("claim, verdict, claimant")
      .eq("country_code", countryCode)
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    return data || [];
  } catch {
    return [];
  }
}

async function getTopCandidates(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<
  Array<{
    short_name: string;
    slug: string;
    party: string;
    party_color: string;
    poll_average: number;
    poll_trend: string;
  }>
> {
  try {
    const { data } = await supabase
      .from("candidates")
      .select(
        "short_name, slug, party, party_color, poll_average, poll_trend"
      )
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .order("poll_average", { ascending: false })
      .limit(5);

    return data || [];
  } catch {
    return [];
  }
}

// =============================================================================
// AI HELPER
// =============================================================================

async function composeBlocks(
  countryCode: CountryCode,
  briefing: BriefingContext | null,
  factChecks: Array<{ claim: string; verdict: string; claimant: string | null }>,
  topCandidates: Array<{
    short_name: string;
    slug: string;
    party: string;
    party_color: string;
    poll_average: number;
    poll_trend: string;
  }>,
  engagement: YesterdayEngagement | null
): Promise<HomepageComposerAIResponse | null> {
  const openai = getOpenAI();

  // Build context sections
  const sections: string[] = [];

  if (briefing) {
    sections.push(`BRIEFING EDITORIAL DE HOY:\n${briefing.editorial_summary}`);

    if (briefing.top_stories && briefing.top_stories.length > 0) {
      sections.push(
        "TOP NOTICIAS:\n" +
          briefing.top_stories
            .map(
              (s, i) =>
                `${i + 1}. [Impacto: ${s.impact_score}/10] "${s.title}" (${s.source})\n   ${s.summary}`
            )
            .join("\n")
      );
    }

    if (briefing.poll_movements && briefing.poll_movements.length > 0) {
      const notable = briefing.poll_movements.filter(
        (p) => p.direction !== "stable"
      );
      if (notable.length > 0) {
        sections.push(
          "MOVIMIENTOS EN ENCUESTAS:\n" +
            notable
              .map(
                (p) =>
                  `- ${p.candidate}: ${p.previous}% → ${p.current}% (${p.direction === "up" ? "↑ sube" : "↓ baja"})`
              )
              .join("\n")
        );
      }
    }
  }

  if (factChecks.length > 0) {
    sections.push(
      "FACT-CHECKS RECIENTES:\n" +
        factChecks
          .map(
            (fc) =>
              `- [${fc.verdict}] "${fc.claim}"${fc.claimant ? ` — ${fc.claimant}` : ""}`
          )
          .join("\n")
    );
  }

  if (topCandidates.length > 0) {
    sections.push(
      "TOP 5 CANDIDATOS:\n" +
        topCandidates
          .map(
            (c) =>
              `- ${c.short_name} (${c.party}, ${c.party_color}): ${c.poll_average.toFixed(1)}% (${c.poll_trend}) [slug: ${c.slug}]`
          )
          .join("\n")
    );
  }

  if (engagement) {
    sections.push(
      `ENGAGEMENT DE AYER (${engagement.clicks_total} clicks totales):\n` +
        engagement.blocks
          .map(
            (b) => `- ${b.block_type}: "${b.title}" — ${b.click_count} clicks`
          )
          .join("\n")
    );
  }

  if (sections.length === 0) {
    console.log(
      `[brain][homepage-composer] No context data available, skipping AI call`
    );
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: BRAIN_PROMPTS.homepageComposer(countryCode),
        },
        {
          role: "user",
          content: `Compone los bloques del homepage basandote en:\n\n${sections.join("\n\n")}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as HomepageComposerAIResponse;

    // Validate
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) return null;
    if (parsed.blocks.length === 0 || parsed.blocks.length > 6) return null;

    return parsed;
  } catch (err) {
    console.error(`[brain][homepage-composer] AI error:`, err);
    return null;
  }
}
