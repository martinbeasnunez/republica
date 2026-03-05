import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI } from "@/lib/ai/openai";
import { COUNTRY_CODES, getCountryConfig, type CountryCode } from "@/lib/config/countries";
import { recalculatePollStats } from "@/lib/data/poll-utils";

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
                content: `Extrae datos de encuestas de INTENCIÓN DE VOTO PRESIDENCIAL de esta noticia electoral de ${config?.name ?? "Perú"}.

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
- Solo extraer si la noticia menciona una ENCUESTA FORMAL de una encuestadora reconocida con CIFRAS EXACTAS
- El pollster DEBE ser EXACTAMENTE uno de la lista de encuestadoras validas (sin sufijos, sin "(estimado)")
- value es el porcentaje exacto mencionado en la noticia (ej: 12.5, 7.3)
- Rango valido: 0.5 a 45.0
- Si no hay datos de encuesta claros con cifras numéricas explícitas, polls = []
- Un medio de comunicación NO es una encuestadora
- NUNCA inventes, estimes o interpoles valores. Solo extrae números TEXTUALMENTE mencionados en la noticia.
- NUNCA agregues "(estimado)" al nombre de la encuestadora

REGLA CRÍTICA PARA COLOMBIA:
- DISTINGUIR entre "intención de voto PRESIDENCIAL" (primera vuelta general) y "intención de voto en CONSULTA" (primaria interna de una coalición).
- Solo extraer intención de voto PRESIDENCIAL (primera vuelta).
- Si la encuesta es sobre una CONSULTA (ej: "Gran Consulta por Colombia", "Consulta del Pacto Histórico"), NO extraer esos números — son de una primaria, no de la elección general.
- Si la noticia mezcla ambas, solo extraer los números de intención presidencial general.`,
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
            // ── Basic validation ──
            if (
              !poll.candidate_id ||
              !poll.value ||
              !poll.pollster ||
              poll.value < 0.5 ||
              poll.value > 45
            ) continue;

            // ── Reject "(estimado)" pollster names ──
            if (/estimado/i.test(poll.pollster)) continue;

            // ── Pollster must be in the valid list (exact match) ──
            const cleanPollster = poll.pollster.trim();
            const isValid = validPollsters.some(
              (p) => p.toLowerCase() === cleanPollster.toLowerCase()
            );
            if (!isValid) continue;

            const candidateExists = candidateRows.some(
              (c) => c.id === poll.candidate_id
            );
            if (!candidateExists) continue;

            // ── Delta check: reject if value differs >15pp from last known ──
            const { data: lastKnown } = await supabase
              .from("poll_data_points")
              .select("value")
              .eq("candidate_id", poll.candidate_id)
              .order("date", { ascending: false })
              .limit(1);

            if (lastKnown && lastKnown.length > 0) {
              const delta = Math.abs(poll.value - lastKnown[0].value);
              if (delta > 15) {
                console.warn(
                  `[update-polls][${countryCode}] REJECTED ${poll.candidate_id}: ${lastKnown[0].value}% → ${poll.value}% (delta ${delta.toFixed(1)}pp > 15pp max)`
                );
                continue;
              }
            }

            // ── Duplicate check: one entry per candidate per pollster per day ──
            const { data: existing } = await supabase
              .from("poll_data_points")
              .select("id")
              .eq("candidate_id", poll.candidate_id)
              .eq("pollster", cleanPollster)
              .eq("date", todayStr)
              .limit(1);

            if (existing && existing.length > 0) continue;

            const { error: insertErr } = await supabase
              .from("poll_data_points")
              .insert({
                candidate_id: poll.candidate_id,
                value: Math.round(poll.value * 10) / 10,
                pollster: cleanPollster,
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

    // ─── 5. Log stale candidates (no fake estimates) ─────────
    if (staleCandidates.length > 0) {
      console.log(
        `[update-polls][${countryCode}] ${staleCandidates.length} candidates have stale poll data (>7 days) — waiting for real data`
      );
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

// recalculatePollStats is now imported from @/lib/data/poll-utils
