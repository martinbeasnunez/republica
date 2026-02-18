import { NextRequest, NextResponse } from "next/server";
import { openai, SYSTEM_PROMPTS } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  try {
    const { headline, content, source } = await req.json();

    if (!headline) {
      return NextResponse.json(
        { error: "Se requiere el titulo de la noticia" },
        { status: 400 }
      );
    }

    const userMessage = `Analiza la siguiente noticia electoral:\n\nTitulo: ${headline}\nFuente: ${source || "No especificada"}\n${content ? `\nContenido: ${content}` : ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.newsAnalyzer },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return NextResponse.json({
      success: true,
      data: {
        headline,
        source,
        ...result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("News analysis API error:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
