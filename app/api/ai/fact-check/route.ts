import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import { getSupabase } from "@/lib/supabase";
import { getCountryConfig, type CountryCode } from "@/lib/config/countries";
import { normalizeVerdict } from "@/lib/fact-check-utils";
import { randomUUID } from "crypto";

/**
 * Fetch recent news articles to give the AI real context.
 * Filtered by country code.
 */
async function getNewsContext(countryCode: CountryCode): Promise<string> {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("news_articles")
      .select("title, summary, source, source_url, published_at, category")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    query = query.eq("country_code", countryCode);

    const { data } = await query;

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
    const { claim, countryCode = "pe" } = await req.json();

    if (!claim || typeof claim !== "string") {
      return NextResponse.json(
        { error: "Se requiere una afirmacion para verificar" },
        { status: 400 }
      );
    }

    const cc = countryCode as CountryCode;
    const config = getCountryConfig(cc);
    const countryName = config?.name ?? "Perú";
    const year = config?.electionDate.slice(0, 4) ?? "2026";

    // Get real news context so AI doesn't hallucinate
    const newsContext = await getNewsContext(cc);

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.factChecker(cc) },
        {
          role: "user",
          content: `Verifica la siguiente afirmacion sobre las elecciones de ${countryName} ${year}:\n\n"${claim}"${newsContext}`,
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
          country_code: cc,
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
