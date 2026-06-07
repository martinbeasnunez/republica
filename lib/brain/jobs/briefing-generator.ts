import type { SupabaseClient } from "@supabase/supabase-js";
import { getCountryConfig, isInRunoffPhase, type CountryCode } from "@/lib/config/countries";
import { getOpenAI } from "@/lib/ai/openai";
import { BRAIN_PROMPTS } from "@/lib/brain/prompts";
import { logAction, logBriefing } from "@/lib/brain/audit";
import { fetchElectionTimelines, type ParsedTimelineItem } from "@/lib/scraper/fetch-timelines";

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

    // ─── Election day detection (use Peru/Colombia time, not UTC) ──
    const config = getCountryConfig(countryCode);
    const tz = countryCode === "pe" ? "America/Lima" : "America/Bogota";
    const localDate = new Date().toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
    // Election window: election day + day after (ONPE count still in progress)
    let isElectionDay = false;
    if (config) {
      if (localDate === config.electionDate) {
        isElectionDay = true;
      } else {
        const elDate = new Date(config.electionDate + "T12:00:00");
        const dayAfter = new Date(elDate);
        dayAfter.setDate(dayAfter.getDate() + 1);
        if (localDate === dayAfter.toISOString().split("T")[0]) {
          isElectionDay = true;
        }
      }
    }

    // ─── 1. Check if briefing already exists today ──────────
    // On election day: UPDATE existing briefing instead of skipping
    // On normal days: skip if already exists (idempotent)
    const { data: existing } = await supabase
      .from("brain_briefings")
      .select("id, editorial_summary")
      .eq("country_code", countryCode)
      .eq("briefing_date", todayStr)
      .limit(1);

    if (existing && existing.length > 0 && !isElectionDay) {
      console.log(
        `[brain][briefing][${countryCode}] Briefing already exists for ${todayStr}, skipping`
      );
      result.briefing_id = existing[0].id;
      result.editorial_summary = existing[0].editorial_summary;
      result.skipped = true;
      return result;
    }

    if (isElectionDay && existing && existing.length > 0) {
      console.log(
        `[brain][briefing][${countryCode}] Election day — updating existing briefing`
      );
    }

    // ─── 2. Gather context data ─────────────────────────────

    // On election day, fetch ONLY today's articles for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recentNews: any[] | null = null;
    if (isElectionDay) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("news_articles")
        .select("title, summary, source, published_at")
        .eq("country_code", countryCode)
        .gte("created_at", todayStart.toISOString())
        .order("published_at", { ascending: false })
        .limit(30);

      recentNews = data;
      if (recentNews && recentNews.length > 0) {
        // REPLACE top stories with only today's articles — no old news
        const todaysStories = recentNews
          .map((n) => ({
            title: n.title,
            summary: n.summary || "",
            source: n.source,
            impact_score: 5,
          }));
        topStories = todaysStories;
        console.log(`[brain][briefing][${countryCode}] Election day — using ${todaysStories.length} articles from today only`);
      } else {
        console.log(`[brain][briefing][${countryCode}] Election day — no articles from today, using curated top stories`);
      }

      // Fetch live timelines from news sites
      const timelines = await fetchElectionTimelines(countryCode);
      if (timelines.raw.length > 0) {
        // Store timeline text as a special "article" for the AI
        topStories.push({
          title: "COBERTURA EN VIVO — Extractos de timelines de medios peruanos",
          summary: timelines.raw.slice(0, 4000), // Cap at 4k chars to stay within token limits
          source: timelines.entries.map((e) => e.source).join(", "),
          impact_score: 10,
        });
      }
    }

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
      dataIssues,
      isElectionDay
    );

    if (!aiResult) {
      console.error(`[brain][briefing][${countryCode}] AI generation failed`);
      result.errors++;
      return result;
    }

    // ─── 4. Save briefing ───────────────────────────────────
    // On election day, delete old briefing and create fresh one
    // But preserve locked timeline if it exists
    let briefingId: string | null = null;
    let lockedTimeline: ParsedTimelineItem[] | null = null;
    if (isElectionDay && existing && existing.length > 0) {
      const existingId = existing[0].id;
      // Check for locked timeline before deleting
      const { data: prevData } = await supabase
        .from("brain_briefings")
        .select("health_status")
        .eq("id", existingId)
        .limit(1);
      const prevHs = prevData?.[0]?.health_status as Record<string, unknown> | undefined;
      if (prevHs?.timeline_locked === true && Array.isArray(prevHs?.timeline)) {
        lockedTimeline = prevHs.timeline as ParsedTimelineItem[];
        console.log(`[brain][briefing][${countryCode}] Preserving locked timeline (${lockedTimeline.length} entries)`);
      }
      await supabase
        .from("brain_briefings")
        .delete()
        .eq("id", existingId);
      console.log(`[brain][briefing][${countryCode}] Election day — deleted old briefing ${existingId}, creating fresh one`);
    }
    {
      briefingId = await logBriefing(supabase, {
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
          last_scrape_ok: true,
          last_verify_ok: true,
          data_quality_score: 0.9,
        },
      });
    }

    // On election day, store key_takeaways + timeline
    if (briefingId && isElectionDay) {
      let timelineEntries: ParsedTimelineItem[] = [];

      // 1. Get RPP liveblog entries
      try {
        const tl = await fetchElectionTimelines(countryCode);
        if (tl.parsed.length > 0) {
          timelineEntries = await summarizeTimelineBlocks(tl.parsed, countryCode);
        }
      } catch { /* skip */ }

      // 2. Always add a "current" block from the AI briefing + latest news
      const peruNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
      const h = peruNow.getHours();
      const halfHour = Math.floor(peruNow.getMinutes() / 30) * 30;
      const period = h < 12 ? "a.m." : "p.m.";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const currentBlockTime = `${displayH}:${String(halfHour).padStart(2, "0")} ${period}`;

      // Only add if we don't already have this block from RPP
      if (!timelineEntries.some((t) => t.time === currentBlockTime)) {
        // Use the editorial summary as the current block
        const currentSummary = aiResult.editorial_summary || "";
        if (currentSummary.length > 10) {
          const sources = recentNews
            ? [...new Set(recentNews.slice(0, 5).map((a) => a.source))].join(", ")
            : "CONDOR AI";
          timelineEntries.unshift({
            time: currentBlockTime,
            text: currentSummary,
            source: sources,
          });
        }
      }

      // 3. Preserve previous blocks from DB
      try {
        const { data: prev } = await supabase
          .from("brain_briefings")
          .select("health_status")
          .eq("id", briefingId)
          .limit(1);
        const prevTl = (prev?.[0]?.health_status as Record<string, unknown>)?.timeline as ParsedTimelineItem[] | undefined;
        if (prevTl) {
          for (const old of prevTl) {
            if (!timelineEntries.some((t) => t.time === old.time)) {
              timelineEntries.push(old);
            }
          }
        }
      } catch { /* skip */ }

      // Sort descending
      timelineEntries.sort((a, b) => {
        const parseT = (t: string) => {
          const parts = t.match(/(\d{1,2}):(\d{2})/);
          if (!parts) return 0;
          let hr = parseInt(parts[1]);
          const mn = parseInt(parts[2]);
          if (t.includes("p.m.") && hr !== 12) hr += 12;
          return hr * 60 + mn;
        };
        return parseT(b.time) - parseT(a.time);
      });

      // Use locked timeline if preserved from before delete, otherwise use generated
      const finalTimeline = lockedTimeline || timelineEntries;

      await supabase
        .from("brain_briefings")
        .update({
          health_status: {
            last_scrape_ok: true,
            last_verify_ok: true,
            data_quality_score: 0.9,
            key_takeaways: aiResult.key_takeaways || [],
            timeline: finalTimeline,
            ...(lockedTimeline ? { timeline_locked: true } : {}),
          },
        })
        .eq("id", briefingId);
    }

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
// TIMELINE SUMMARIZER
// =============================================================================

/**
 * Group timeline entries into ~30 min blocks and summarize each with AI.
 * Returns summarized entries like:
 *   "9:00 - 9:30 a.m." → "3 key things that happened"
 */
async function summarizeTimelineBlocks(
  entries: ParsedTimelineItem[],
  countryCode: CountryCode
): Promise<ParsedTimelineItem[]> {
  const openai = getOpenAI();

  // Parse time to minutes for grouping
  const parseMinutes = (t: string): number => {
    const parts = t.match(/(\d{1,2}):(\d{2})/);
    if (!parts) return 0;
    let h = parseInt(parts[1]);
    const m = parseInt(parts[2]);
    if (t.toLowerCase().includes("p.m") && h !== 12) h += 12;
    if (t.toLowerCase().includes("a.m") && h === 12) h = 0;
    return h * 60 + m;
  };

  // Group into 30-min blocks
  const blocks = new Map<string, ParsedTimelineItem[]>();
  for (const entry of entries) {
    const mins = parseMinutes(entry.time);
    const blockStart = Math.floor(mins / 30) * 30;
    const h = Math.floor(blockStart / 60);
    const m = blockStart % 60;
    const period = h < 12 ? "a.m." : "p.m.";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const blockKey = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
    if (!blocks.has(blockKey)) blocks.set(blockKey, []);
    blocks.get(blockKey)!.push(entry);
  }

  // Summarize each block with AI
  const results: ParsedTimelineItem[] = [];
  const sortedBlocks = [...blocks.entries()].sort((a, b) => {
    return parseMinutes(b[0]) - parseMinutes(a[0]); // most recent first
  });

  for (const [blockTime, blockEntries] of sortedBlocks.slice(0, 8)) {
    const sources = [...new Set(blockEntries.map((e) => e.source))];
    const entriesText = blockEntries.map((e) => `- ${e.text}`).join("\n");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un editor de noticias. Resume las siguientes entradas de un timeline electoral en EXACTAMENTE 2-3 frases cortas y concretas. Solo hechos, sin opinión. En español. Máximo 150 caracteres por frase. NO uses bullet points, solo texto corrido separado por puntos.",
          },
          {
            role: "user",
            content: `Entradas del bloque ${blockTime}:\n${entriesText}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const summary = completion.choices[0]?.message?.content?.trim();
      if (summary && summary.length > 10) {
        results.push({
          time: blockTime,
          text: summary,
          source: sources.join(", "),
        });
      }
    } catch {
      // If AI fails, use first entry as fallback
      results.push({
        time: blockTime,
        text: blockEntries[0].text.slice(0, 180),
        source: sources.join(", "),
      });
    }
  }

  return results;
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
    // In runoff phase, restrict movements to the two finalists so the AI doesn't
    // anchor the editorial summary on candidates that were eliminated in round 1.
    const config = getCountryConfig(countryCode);
    const runoffActive = isInRunoffPhase(countryCode) && config?.runoffCandidateSlugs;

    let candidatesQuery = supabase
      .from("candidates")
      .select("id, short_name, poll_average, poll_trend, slug")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .order("poll_average", { ascending: false });

    if (runoffActive) {
      candidatesQuery = candidatesQuery.in(
        "slug",
        config!.runoffCandidateSlugs as unknown as string[]
      );
    }

    const { data: candidates } = await candidatesQuery;

    if (!candidates) return [];

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const movements: PollMovement[] = [];
    const avg = (arr: Array<{ value: number }>) =>
      arr.reduce((s, p) => s + p.value, 0) / arr.length;

    for (const c of candidates) {
      if (runoffActive && config?.electionDate) {
        // Runoff: derive movement from runoff-only polls (post first round), never
        // from the blended stored average (which still mixes in round-1 polls).
        const { data: runoffPolls } = await supabase
          .from("poll_data_points")
          .select("value, date")
          .eq("candidate_id", c.id)
          .gt("date", config.electionDate)
          .order("date", { ascending: false });

        if (!runoffPolls || runoffPolls.length === 0) continue;

        const latestDate = runoffPolls[0].date;
        const current = avg(runoffPolls.filter((p) => p.date === latestDate));
        const older = runoffPolls.filter((p) => p.date < latestDate);
        const previous = older.length ? avg(older.filter((p) => p.date === older[0].date)) : current;
        const diff = current - previous;

        movements.push({
          candidate: c.short_name,
          previous: Math.round(previous * 10) / 10,
          current: Math.round(current * 10) / 10,
          direction: diff > 0.3 ? "up" : diff < -0.3 ? "down" : "stable",
        });
        continue;
      }

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
  dataIssues: DataIssue[],
  isElectionDay = false
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

  // On election day, polls are irrelevant — skip them
  if (!isElectionDay && pollMovements.length > 0) {
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
          content: isElectionDay
            ? BRAIN_PROMPTS.electionDayAnalyst(countryCode)
            : BRAIN_PROMPTS.briefingWriter(countryCode),
        },
        {
          role: "user",
          content: isElectionDay
            ? `HORA ACTUAL: ${new Date().toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit" })} (hora de Lima).\n\nGenera el análisis EN VIVO de la jornada electoral basándote en:\n\n${sections.join("\n\n")}`
            : `Genera el briefing editorial del dia basandote en:\n\n${sections.join("\n\n")}`,
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
