import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import { normalizeVerdict } from "@/lib/fact-check-utils";
import { randomUUID } from "crypto";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";

/**
 * CRON: Auto-verify claims from recent news articles
 *
 * Runs every 4 hours (same as scraper). Picks up to 5 recent articles
 * per country that haven't been fact-checked yet and generates fact-check entries.
 *
 * Supports ?country=pe or ?country=co to run for a specific country.
 * Defaults to running for ALL countries.
 *
 * Trigger: GET /api/cron/auto-verify
 * Auth: Bearer CRON_SECRET
 */

const MAX_CHECKS_PER_RUN = 5;

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
    const stats = await verifyCountry(countryCode);
    allStats[countryCode] = stats;
  }

  return NextResponse.json({ success: true, stats: allStats });
}

async function verifyCountry(countryCode: CountryCode) {
  const supabase = getSupabase();
  const stats = { country: countryCode, checked: 0, saved: 0, errors: 0, skipped: 0 };

  try {
    // ─── 1. Check if fact_checks table exists ───────────────
    const { error: tableCheck } = await supabase
      .from("fact_checks")
      .select("id")
      .limit(1);

    if (tableCheck) {
      return { ...stats, error: "fact_checks table does not exist" };
    }

    // ─── 2. Get IDs of articles already fact-checked ────────
    let existingQuery = supabase
      .from("fact_checks")
      .select("claim")
      .order("created_at", { ascending: false })
      .limit(200);

    existingQuery = existingQuery.eq("country_code", countryCode);

    const { data: existingChecks } = await existingQuery;

    const existingClaims = new Set(
      (existingChecks || []).map((c) => c.claim.toLowerCase().trim())
    );

    // ─── 3. Fetch recent news articles ──────────────────────
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: articles, error: articlesError } = await supabase
      .from("news_articles")
      .select("id, title, summary, source, category, fact_check, published_at")
      .eq("is_active", true)
      .eq("country_code", countryCode)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(50);

    if (articlesError || !articles || articles.length === 0) {
      return { ...stats, message: "No recent articles found" };
    }

    // ─── 4. Extract verifiable claims ───────────────────────
    const candidates = articles
      .filter((a) => {
        const titleLower = a.title.toLowerCase().trim();
        return !existingClaims.has(titleLower);
      })
      .sort((a, b) => {
        const aScore = a.fact_check === "questionable" ? 10 : a.fact_check === "false" ? 8 : 0;
        const bScore = b.fact_check === "questionable" ? 10 : b.fact_check === "false" ? 8 : 0;
        return bScore - aScore;
      })
      .slice(0, MAX_CHECKS_PER_RUN);

    if (candidates.length === 0) {
      return { ...stats, message: "No new articles to verify" };
    }

    // ─── 5. Generate claims from article titles/summaries ───
    const claimsToVerify = await extractClaimsFromArticles(candidates, countryCode);

    // ─── 5b. Build news context for fact-checking ───────────
    const newsLines = articles.map(
      (a) => `- [${a.published_at}] ${a.title} (${a.source}): ${a.summary?.substring(0, 150) || ""}`
    );
    const newsContext = `\n\nNOTICIAS RECIENTES VERIFICADAS (usa estas como evidencia):\n${newsLines.join("\n")}`;

    // ─── 6. Fact-check each claim ──────────────────────────
    for (const { claim, article } of claimsToVerify) {
      if (existingClaims.has(claim.toLowerCase().trim())) {
        stats.skipped++;
        continue;
      }

      try {
        const result = await factCheckClaim(claim, newsContext, countryCode);

        if (!result) {
          stats.errors++;
          continue;
        }

        const verdict = normalizeVerdict(result.verdict);
        if (verdict === "NO_VERIFICABLE") {
          stats.skipped++;
          continue;
        }

        const id = `fc-${randomUUID().slice(0, 8)}`;
        const { error: insertError } = await supabase
          .from("fact_checks")
          .insert({
            id,
            claim,
            verdict,
            explanation: result.explanation || "",
            sources: result.sources || [],
            source_urls: result.source_urls || [],
            confidence: result.confidence || 0,
            context: `Verificacion automatica basada en: "${article.title}" (${article.source})`,
            claimant: result.claimant || article.source || "Desconocido",
            claim_origin: result.claim_origin || `Articulo de ${article.source}, ${article.published_at}`,
            country_code: countryCode,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`[auto-verify][${countryCode}] Failed to insert:`, insertError);
          stats.errors++;
        } else {
          stats.saved++;
          existingClaims.add(claim.toLowerCase().trim());
        }

        stats.checked++;
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(`[auto-verify][${countryCode}] Error for claim:`, claim, err);
        stats.errors++;
      }
    }

    return stats;
  } catch (error) {
    console.error(`[auto-verify][${countryCode}] Fatal error:`, error);
    return { ...stats, error: String(error) };
  }
}

// ─── Extract verifiable claims from article titles/summaries ───

interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  fact_check: string | null;
  published_at: string;
}

async function extractClaimsFromArticles(
  articles: ArticleRow[],
  countryCode: CountryCode
): Promise<{ claim: string; article: ArticleRow }[]> {
  const claims: { claim: string; article: ArticleRow }[] = [];

  try {
    const articlesText = articles
      .map((a, i) => `[${i}] "${a.title}" — ${a.summary}`)
      .join("\n");

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.claimExtractor(countryCode),
        },
        {
          role: "user",
          content: `Extrae o genera afirmaciones verificables de estos titulares:\n\n${articlesText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 1000,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{"claims":[]}'
    );

    const extractedClaims: string[] = result.claims || [];

    for (let i = 0; i < extractedClaims.length && i < articles.length; i++) {
      const claim = extractedClaims[i]?.trim();
      if (claim && claim !== "SKIP" && claim.length > 10) {
        claims.push({ claim, article: articles[i] });
      }
    }
  } catch (err) {
    console.error(`[auto-verify][${countryCode}] Failed to extract claims:`, err);
    for (const article of articles) {
      claims.push({ claim: article.title, article });
    }
  }

  return claims;
}

// ─── Fact-check a single claim ───

interface FactCheckResult {
  verdict: string;
  explanation: string;
  sources: string[];
  source_urls: string[];
  confidence: number;
  context: string;
  claimant: string;
  claim_origin: string;
}

async function factCheckClaim(
  claim: string,
  newsContext: string,
  countryCode: CountryCode
): Promise<FactCheckResult | null> {
  try {
    const config = await import("@/lib/config/countries").then(m => m.getCountryConfig(countryCode));
    const countryName = config?.name ?? "Perú";
    const year = config?.electionDate.slice(0, 4) ?? "2026";

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.factChecker(countryCode) },
        {
          role: "user",
          content: `Verifica la siguiente afirmacion sobre las elecciones de ${countryName} ${year}:\n\n"${claim}"${newsContext}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    return JSON.parse(
      completion.choices[0].message.content || "null"
    );
  } catch (err) {
    console.error(`[auto-verify][${countryCode}] OpenAI error:`, err);
    return null;
  }
}
