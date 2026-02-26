import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import { normalizeVerdict } from "@/lib/fact-check-utils";
import { randomUUID } from "crypto";

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS fact_checks (
  id TEXT PRIMARY KEY,
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('VERDADERO', 'PARCIALMENTE_VERDADERO', 'ENGANOSO', 'FALSO', 'NO_VERIFICABLE')),
  explanation TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',
  source_urls TEXT[] DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0,
  context TEXT DEFAULT '',
  claimant TEXT DEFAULT 'Desconocido',
  claim_origin TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fact_checks" ON fact_checks FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_fact_checks_recent ON fact_checks(created_at DESC);`;

/**
 * Setup & seed endpoint for fact_checks table.
 *
 * GET  /api/setup/fact-checks          → Check table status
 * POST /api/setup/fact-checks          → Seed initial fact-checks from news articles
 * POST /api/setup/fact-checks?count=5  → Seed N fact-checks
 */

export async function GET() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("fact_checks")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({
        exists: false,
        message: "Table does not exist. Paste this SQL into Supabase Dashboard > SQL Editor:",
        sql: CREATE_TABLE_SQL,
      });
    }

    const { count } = await supabase
      .from("fact_checks")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      exists: true,
      rows: count || 0,
      message: count && count > 0
        ? `Table ready with ${count} fact-checks!`
        : "Table exists but is empty. POST to this endpoint to seed initial fact-checks.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** DELETE /api/setup/fact-checks — Remove all fact-checks (for re-seeding) */
export async function DELETE() {
  try {
    const supabase = getSupabase();
    // Delete all rows (neq id '' matches everything)
    const { error } = await supabase
      .from("fact_checks")
      .delete()
      .neq("id", "");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "All fact-checks deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();

    // Check table exists
    const { error: tableError } = await supabase
      .from("fact_checks")
      .select("id")
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        error: "Table does not exist. Run the SQL first.",
        sql: CREATE_TABLE_SQL,
      }, { status: 400 });
    }

    // Get count param (default 5)
    const url = new URL(request.url);
    const count = Math.min(parseInt(url.searchParams.get("count") || "5"), 10);

    // Fetch recent news articles to base fact-checks on
    const { data: articles } = await supabase
      .from("news_articles")
      .select("id, title, summary, source, category, published_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: "No news articles found to generate fact-checks from" }, { status: 400 });
    }

    // Check existing to avoid duplicates
    const { data: existing } = await supabase
      .from("fact_checks")
      .select("claim")
      .limit(200);
    const existingClaims = new Set(
      (existing || []).map((c) => c.claim.toLowerCase().trim())
    );

    // Extract claims from articles using AI
    const articlesText = articles
      .slice(0, 15)
      .map((a, i) => `[${i}] "${a.title}" — ${a.summary?.substring(0, 100) || ""}`)
      .join("\n");

    const extractResult = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un generador de afirmaciones para un verificador de hechos sobre las elecciones peruanas 2026.

Dadas estas noticias, genera ${count + 3} afirmaciones verificables. IMPORTANTE: genera una MEZCLA de tipos:

- ~40% VERDADERAS: afirmaciones directas de los titulares que son correctas
- ~25% FALSAS: distorsiones, exageraciones o datos incorrectos basados en las noticias (ej: cambiar cifras, atribuir declaraciones al candidato equivocado, inventar cargos o renuncias que no ocurrieron)
- ~20% ENGAÑOSAS: afirmaciones que son técnicamente parciales o sacan de contexto (ej: omitir que algo es una propuesta y presentarlo como hecho consumado)
- ~15% PARCIALMENTE VERDADERAS: afirmaciones que mezclan datos reales con imprecisiones

Esto es para un verificador de hechos educativo. Las afirmaciones falsas deben ser PLAUSIBLES (como desinformación real que circula en redes sociales), no absurdas.

Responde con JSON: { "claims": [{ "text": "afirmación", "articleIndex": 0 }] }`,
        },
        { role: "user", content: articlesText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const extracted = JSON.parse(
      extractResult.choices[0].message.content || '{"claims":[]}'
    );

    const claims: { text: string; articleIndex: number }[] = (extracted.claims || [])
      .filter((c: { text: string }) => c.text && c.text.length > 10 && !existingClaims.has(c.text.toLowerCase().trim()))
      .slice(0, count);

    if (claims.length === 0) {
      return NextResponse.json({ message: "No new claims to verify (all already exist)" });
    }

    // Build news context for fact-checking
    const newsLines = articles.map(
      (a) => `- [${a.published_at}] ${a.title} (${a.source}): ${a.summary?.substring(0, 150) || ""}`
    );
    const newsContext = `\n\nNOTICIAS RECIENTES VERIFICADAS (usa estas como evidencia):\n${newsLines.join("\n")}`;

    // Fact-check each claim
    const results: { id: string; claim: string; verdict: string }[] = [];
    const errors: string[] = [];

    for (const { text: claim, articleIndex } of claims) {
      try {
        const article = articles[articleIndex] || articles[0];

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

        const result = JSON.parse(
          completion.choices[0].message.content || "{}"
        );

        const verdict = normalizeVerdict(result.verdict);

        // Skip NO_VERIFICABLE
        if (verdict === "NO_VERIFICABLE") {
          errors.push(`Skipped "${claim.substring(0, 40)}...": not verifiable`);
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
            context: `Basado en: "${article.title}" (${article.source})`,
            claimant: result.claimant || article.source || "Desconocido",
            claim_origin: result.claim_origin || `${article.source}, ${article.published_at?.substring(0, 10)}`,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          errors.push(`Insert error for "${claim.substring(0, 30)}...": ${insertError.message}`);
        } else {
          results.push({ id, claim, verdict: result.verdict || "?" });
          existingClaims.add(claim.toLowerCase().trim());
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        errors.push(`Error for "${claim.substring(0, 30)}...": ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json({
      success: true,
      seeded: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
