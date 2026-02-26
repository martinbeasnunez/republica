import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import { normalizeVerdict } from "@/lib/fact-check-utils";
import { randomUUID } from "crypto";

/**
 * CRON: Auto-verify claims from recent news articles
 *
 * Runs every 4 hours (same as scraper). Picks up to 5 recent articles
 * that haven't been fact-checked yet and generates fact-check entries.
 *
 * This populates the /verificador page with real, AI-generated verifications
 * based on actual news articles scraped from Peruvian media.
 *
 * Trigger: GET /api/cron/auto-verify?source=cron
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

  const supabase = getSupabase();
  const stats = { checked: 0, saved: 0, errors: 0, skipped: 0 };

  try {
    // ─── 1. Check if fact_checks table exists ───────────────
    const { error: tableCheck } = await supabase
      .from("fact_checks")
      .select("id")
      .limit(1);

    if (tableCheck) {
      return NextResponse.json({
        error: "fact_checks table does not exist. Run the SQL from scripts/create-fact-checks-table.sql",
        stats,
      });
    }

    // ─── 2. Get IDs of articles already fact-checked ────────
    const { data: existingChecks } = await supabase
      .from("fact_checks")
      .select("claim")
      .order("created_at", { ascending: false })
      .limit(200);

    const existingClaims = new Set(
      (existingChecks || []).map((c) => c.claim.toLowerCase().trim())
    );

    // ─── 3. Fetch recent news articles ──────────────────────
    // Get articles from the last 48 hours that are active
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: articles, error: articlesError } = await supabase
      .from("news_articles")
      .select("id, title, summary, source, category, fact_check, published_at")
      .eq("is_active", true)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(50);

    if (articlesError || !articles || articles.length === 0) {
      return NextResponse.json({
        message: "No recent articles found",
        stats,
      });
    }

    // ─── 4. Extract verifiable claims from articles ─────────
    // Prioritize: articles with questionable fact_check > breaking > recent
    const candidates = articles
      .filter((a) => {
        // Skip if we already fact-checked something very similar
        const titleLower = a.title.toLowerCase().trim();
        return !existingClaims.has(titleLower);
      })
      .sort((a, b) => {
        // Prioritize questionable articles
        const aScore = a.fact_check === "questionable" ? 10 : a.fact_check === "false" ? 8 : 0;
        const bScore = b.fact_check === "questionable" ? 10 : b.fact_check === "false" ? 8 : 0;
        return bScore - aScore;
      })
      .slice(0, MAX_CHECKS_PER_RUN);

    if (candidates.length === 0) {
      return NextResponse.json({
        message: "No new articles to verify",
        stats,
      });
    }

    // ─── 5. Generate claims from article titles/summaries ───
    const claimsToVerify = await extractClaimsFromArticles(candidates);

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
        const result = await factCheckClaim(claim, newsContext);

        if (!result) {
          stats.errors++;
          continue;
        }

        // Save to DB (skip NO_VERIFICABLE — not useful)
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
            context: `Verificación automática basada en: "${article.title}" (${article.source})`,
            claimant: result.claimant || article.source || "Desconocido",
            claim_origin: result.claim_origin || `Artículo de ${article.source}, ${article.published_at}`,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Failed to insert fact-check:", insertError);
          stats.errors++;
        } else {
          stats.saved++;
          existingClaims.add(claim.toLowerCase().trim());
        }

        stats.checked++;

        // Small delay between API calls
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error("Fact-check error for claim:", claim, err);
        stats.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      message: `Verified ${stats.checked} claims, saved ${stats.saved}, skipped ${stats.skipped}`,
    });
  } catch (error) {
    console.error("Auto-verify cron error:", error);
    return NextResponse.json(
      { error: "Internal error", stats },
      { status: 500 }
    );
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
  articles: ArticleRow[]
): Promise<{ claim: string; article: ArticleRow }[]> {
  const claims: { claim: string; article: ArticleRow }[] = [];

  try {
    // Use AI to extract the most verifiable claim from each article
    const articlesText = articles
      .map((a, i) => `[${i}] "${a.title}" — ${a.summary}`)
      .join("\n");

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un generador de afirmaciones para un verificador de hechos sobre las elecciones peruanas 2026.

Dada una lista de titulares, genera UNA afirmación verificable por cada titular. IMPORTANTE: genera una MEZCLA de tipos para que el verificador sea útil:

- Para 2-3 titulares: extrae la afirmación REAL y correcta del titular
- Para 1-2 titulares: genera una versión DISTORSIONADA o EXAGERADA (ej: cambiar cifras, atribuir al candidato equivocado, presentar propuesta como hecho consumado)
- Para 1 titular: genera una afirmación PARCIALMENTE correcta que mezcle datos reales con imprecisiones

Las afirmaciones falsas/engañosas deben ser PLAUSIBLES, como desinformación real en redes sociales.
Si el titular es solo opinión, escribe "SKIP".
Responde en español.

FORMATO (JSON):
{ "claims": ["afirmación 1 o SKIP", "afirmación 2 o SKIP", ...] }`,
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
    console.error("Failed to extract claims:", err);
    // Fallback: use article titles directly
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

async function factCheckClaim(claim: string, newsContext: string): Promise<FactCheckResult | null> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.factChecker },
        {
          role: "user",
          content: `Verifica la siguiente afirmación sobre las elecciones peruanas 2026:\n\n"${claim}"${newsContext}`,
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
    console.error("OpenAI fact-check error:", err);
    return null;
  }
}
