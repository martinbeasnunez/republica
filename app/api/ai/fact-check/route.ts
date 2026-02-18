import { NextRequest, NextResponse } from "next/server";
import { openai, SYSTEM_PROMPTS } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  try {
    const { claim } = await req.json();

    if (!claim || typeof claim !== "string") {
      return NextResponse.json(
        { error: "Se requiere una afirmacion para verificar" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.factChecker },
        {
          role: "user",
          content: `Verifica la siguiente afirmacion sobre las elecciones peruanas 2026:\n\n"${claim}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return NextResponse.json({
      success: true,
      data: {
        claim,
        ...result,
        timestamp: new Date().toISOString(),
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
