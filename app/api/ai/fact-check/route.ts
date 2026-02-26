import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import { getSupabase } from "@/lib/supabase";
import { normalizeVerdict } from "@/lib/fact-check-utils";
import { randomUUID } from "crypto";

/**
 * Fetch recent news articles to give the AI real context.
 * This prevents the AI from saying "I don't have recent data".
 */
async function getNewsContext(): Promise<string> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("news_articles")
      .select("title, summary, source, source_url, published_at, category")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) return "";

    const lines = data.map(
      (a) =>
        `- [${a.published_at}] ${a.title} (${a.source}${a.source_url ? ", " + a.source_url : ""}): ${a.summary?.substring(0, 150) || ""}`
    );

    return `\n\nNOTICIAS RECIENTES VERIFICADAS (usa estas como evidencia):\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { claim } = await req.json();

    if (!claim || typeof claim !== "string") {
      return NextResponse.json(
        { error: "Se requiere una afirmacion para verificar" },
        { status: 400 }
      );
    }

    // Get real news context so AI doesn't hallucinate
    const newsContext = await getNewsContext();

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
    const id = `fc-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Save to Supabase (skip NO_VERIFICABLE — not useful to store)
    if (verdict !== "NO_VERIFICABLE") {
      try {
        const supabase = getSupabase();
        await supabase.from("fact_checks").insert({
          id,
          claim,
          verdict,
          explanation: result.explanation || "",
          sources: result.sources || [],
          source_urls: result.source_urls || [],
          confidence: result.confidence || 0,
          context: result.context || "",
          claimant: result.claimant || "Desconocido",
          claim_origin: result.claim_origin || "",
          created_at: now,
        });
      } catch (dbErr) {
        console.error("Failed to save fact-check to DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        claim,
        ...result,
        verdict,
        source_urls: result.source_urls || [],
        claimant: result.claimant || "Desconocido",
        claim_origin: result.claim_origin || "",
        timestamp: now,
      },
    });
  } catch (error: unknown) {
    console.error("Fact-check API error:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
