import { NextRequest, NextResponse } from "next/server";
import { openai, SYSTEM_PROMPTS } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  try {
    const { candidateName, planText, topic } = await req.json();

    if (!candidateName) {
      return NextResponse.json(
        { error: "Se requiere el nombre del candidato" },
        { status: 400 }
      );
    }

    const userMessage = topic
      ? `Analiza la posicion de ${candidateName} sobre el tema "${topic}" basandote en su plan de gobierno:\n\n${planText || "No se proporciono texto del plan. Genera un analisis basado en informacion publica conocida sobre este candidato."}`
      : `Analiza el plan de gobierno de ${candidateName}:\n\n${planText || "No se proporciono texto del plan. Genera un analisis basado en informacion publica conocida sobre este candidato."}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.planAnalyzer },
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
