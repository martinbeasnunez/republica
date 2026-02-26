import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import type { CountryCode } from "@/lib/config/countries";

export async function POST(req: NextRequest) {
  try {
    const { candidateName, planText, topic, countryCode = "pe" } = await req.json();

    if (!candidateName) {
      return NextResponse.json(
        { error: "Se requiere el nombre del candidato" },
        { status: 400 }
      );
    }

    const cc = countryCode as CountryCode;

    const userMessage = topic
      ? `Analiza la posición de ${candidateName} sobre el tema "${topic}" basándote en su plan de gobierno:\n\n${planText || "No se proporcionó texto del plan. Genera un análisis basado en información pública conocida sobre este candidato."}`
      : `Analiza el plan de gobierno de ${candidateName}:\n\n${planText || "No se proporcionó texto del plan. Genera un análisis basado en información pública conocida sobre este candidato."}`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.planAnalyzer(cc) },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2000,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return NextResponse.json({
      success: true,
      data: {
        candidateName,
        topic: topic || "general",
        ...result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Plan analysis API error:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
