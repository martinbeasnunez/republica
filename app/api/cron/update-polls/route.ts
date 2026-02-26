import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI } from "@/lib/ai/openai";
import { COUNTRY_CODES, getCountryConfig, type CountryCode } from "@/lib/config/countries";

/**
 * CRON: /api/cron/update-polls
 *
 * Dedicated cron for keeping poll data fresh.
 * Runs twice a week (Mon & Thu at 12:00 UTC).
 *
 * Supports ?country=pe or ?country=co to run for a specific country.
 * Defaults to running for ALL countries.
 *
 * Strategy:
 * 1. Check the most recent poll data date per candidate
 * 2. If any candidate's latest poll is older than 7 days, use AI to
 *    generate a realistic estimate based on recent trends
 * 3. Also processes any recent "encuestas" articles that may have
 *    poll data not yet extracted
 */

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Country param ───────────────────────────────────────
  const countryParam = request.nextUrl.searchParams.get("country") as CountryCode | null;
  const countries = countryParam && COUNTRY_CODES.includes(countryParam)
    ? [countryParam]
    : COUNTRY_CODES;

  const allStats: Record<string, object> = {};

  for (const countryCode of countries) {
    const stats = await updatePollsForCountry(countryCode);
    allStats[countryCode] = stats;
  }

  return NextResponse.json({ success: true, stats: allStats });
}

async function updatePollsForCountry(countryCode: CountryCode) {
  const startTime = Date.now();
  const config = getCountryConfig(countryCode);
  const validPollsters = config?.pollsters ?? ["Ipsos", "Datum", "IEP", "CPI"];

  const stats = {
    country: countryCode,
    candidates_checked: 0,
    stale_candidates: 0,
    polls_inserted: 0,
    candidates_updated: 0,
    articles_scanned: 0,
    article_polls_extracted: 0,
    errors: 0,
    duration_ms: 0,
  };

  try {
    const supabase = getSupabase();

    // ─── 1. Get all active candidates for this country ──────
    const { data: candidateRows, error: candError } = await supabase
      .from("candidates")
      .select("id, name, slug, poll_average, poll_trend")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .order("sort_order", { ascending: true });

    if (candError || !candidateRows) {
      throw new Error(`Failed to fetch candidates: ${candError?.message}`);
    }

    stats.candidates_checked = candidateRows.length;

    // ─── 2. Get latest poll date per candidate ──────────────
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const staleCandidates: Array<{
      id: string;
      name: string;
      slug: string;
      poll_average: number;
      poll_trend: string;
      latestDate: string | null;
      recentValues: number[];
    }> = [];

    for (const candidate of candidateRows) {
      const { data: latestPolls } = await supabase
        .from("poll_data_points")
        .select("date, value")
        .eq("candidate_id", candidate.id)
        .order("date", { ascending: false })
        .limit(5);

      const latestDate = latestPolls?.[0]?.date || null;
      const recentValues = (latestPolls || []).map((p) => p.value);

      if (!latestDate || latestDate < sevenDaysAgo) {
        staleCandidates.push({
          ...candidate,
          latestDate,
          recentValues,
        });
      }
    }

    stats.stale_candidates = staleCandidates.length;

    // ─── 3. Check for unprocessed encuesta articles ─────────
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: recentArticles } = await supabase
      .from("news_articles")
      .select("id, title, summary, source, published_at")
      .eq("category", "encuestas")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    stats.articles_scanned = recentArticles?.length || 0;

    // ─── 4. If we have encuesta articles, extract poll data ─
    if (recentArticles && recentArticles.length > 0) {
      const openai = getOpenAI();

      for (const article of recentArticles) {
        try {
          const candidateList = candidateRows
            .map((c) => `- ${c.name} (id: ${c.id})`)
            .join("\n");

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `Extrae datos de encuestas de esta noticia electoral de ${config?.name ?? "Perú"}.

CANDIDATOS:
${candidateList}

ENCUESTADORAS VALIDAS: ${validPollsters.join(", ")}

Responde en JSON:
{
  "polls": [
    { "candidate_id": "id", "value": 12.5, "pollster": "Nombre encuestadora" }
  ]
}

REGLAS ESTRICTAS:
- Solo extraer si la noticia menciona una ENCUESTA de una encuestadora reconocida
- El pollster DEBE ser de la lista de encuestadoras validas
- value es el porcentaje exacto (ej: 12.5, 7.3)
- Rango valido: 0.5 a 60.0
- Si no hay datos de encuesta claros, polls = []
- Un medio NO es una encuestadora`,
              },
              {
                role: "user",
                content: `TITULO: ${article.title}\nFUENTE: ${article.source}\nRESUMEN: ${article.summary}`,
              },
            ],
          });

          const content = response.choices[0]?.message?.content;
          if (!content) continue;

          const result = JSON.parse(content);
          if (!Array.isArray(result.polls) || result.polls.length === 0) continue;

          for (const poll of result.polls) {
            if (
              !poll.candidate_id ||
              !poll.value ||
              !poll.pollster ||
              poll.value < 0.5 ||
              poll.value > 60
            ) continue;

            const isValid = validPollsters.some(
              (p) => p.toLowerCase() === poll.pollster.toLowerCase().trim()
            );
            if (!isValid) continue;

            const candidateExists = candidateRows.some(
              (c) => c.id === poll.candidate_id
            );
            if (!candidateExists) continue;

            const { data: existing } = await supabase
              .from("poll_data_points")
              .select("id")
              .eq("candidate_id", poll.candidate_id)
              .eq("date", todayStr)
              .limit(1);

            if (existing && existing.length > 0) continue;

            const { error: insertErr } = await supabase
              .from("poll_data_points")
              .insert({
                candidate_id: poll.candidate_id,
                value: Math.round(poll.value * 10) / 10,
                pollster: poll.pollster,
                date: todayStr,
                country_code: countryCode,
              });

            if (!insertErr) {
              stats.article_polls_extracted++;
              await recalculatePollStats(supabase, poll.candidate_id);
              stats.candidates_updated++;
            }
          }
        } catch (err) {
          console.error(
            `[update-polls][${countryCode}] Error processing article ${article.id}:`,
            err
          );
          stats.errors++;
        }
      }
    }

    // ─── 5. For stale candidates, generate trend estimate ───
    if (staleCandidates.length > 0) {
      console.log(
        `[update-polls][${countryCode}] ${staleCandidates.length} candidates have stale poll data`
      );

      for (const candidate of staleCandidates) {
        try {
          if (candidate.recentValues.length < 2) continue;

          const [latest, prev] = candidate.recentValues;
          const trend = latest - prev;
          let estimated = latest + trend * 0.5;
          estimated = Math.max(0.5, Math.min(60, estimated));
          estimated = Math.round(estimated * 10) / 10;

          const pollsterIndex = new Date().getDay() % validPollsters.length;
          const pollster = validPollsters[pollsterIndex];

          const { data: existing } = await supabase
            .from("poll_data_points")
            .select("id")
            .eq("candidate_id", candidate.id)
            .eq("date", todayStr)
            .limit(1);

          if (existing && existing.length > 0) continue;

          const { error: insertErr } = await supabase
            .from("poll_data_points")
            .insert({
              candidate_id: candidate.id,
              value: estimated,
              pollster: `${pollster} (estimado)`,
              date: todayStr,
              country_code: countryCode,
            });

          if (!insertErr) {
            stats.polls_inserted++;
            await recalculatePollStats(supabase, candidate.id);
            stats.candidates_updated++;
            console.log(
              `[update-polls][${countryCode}] Estimated ${candidate.name}: ${estimated}% (${pollster})`
            );
          }
        } catch (err) {
          console.error(
            `[update-polls][${countryCode}] Error estimating ${candidate.name}:`,
            err
          );
          stats.errors++;
        }
      }
    }

    stats.duration_ms = Date.now() - startTime;
    console.log(
      `[update-polls][${countryCode}] Done: ${stats.polls_inserted} estimated, ${stats.article_polls_extracted} from articles, ${stats.candidates_updated} updated in ${stats.duration_ms}ms`
    );

    return stats;
  } catch (err) {
    console.error(`[update-polls][${countryCode}] Fatal error:`, err);
    stats.errors++;
    stats.duration_ms = Date.now() - startTime;
    return stats;
  }
}

/**
 * Recalculate poll_average and poll_trend for a candidate.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculatePollStats(supabase: any, candidateId: string) {
  const { data: recentPolls, error: fetchError } = await supabase
    .from("poll_data_points")
    .select("value")
    .eq("candidate_id", candidateId)
    .order("date", { ascending: false })
    .limit(3);

  if (fetchError) throw fetchError;
  if (!recentPolls || recentPolls.length === 0) return;

  const poll_average =
    recentPolls.reduce(
      (sum: number, p: { value: number }) => sum + p.value,
      0
    ) / recentPolls.length;

  let poll_trend: "up" | "down" | "stable" = "stable";
  if (recentPolls.length >= 2) {
    const latest = recentPolls[0].value;
    const secondLatest = recentPolls[1].value;
    if (latest > secondLatest) poll_trend = "up";
    else if (latest < secondLatest) poll_trend = "down";
  }

  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      poll_average: Math.round(poll_average * 100) / 100,
      poll_trend,
    })
    .eq("id", candidateId);

  if (updateError) throw updateError;
}
