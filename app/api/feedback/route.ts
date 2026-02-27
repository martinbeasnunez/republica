import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/openai";
import { getSupabase } from "@/lib/supabase";

/**
 * Feedback submission endpoint.
 *
 * POST — Receives a conversation, uses AI to extract product suggestions,
 *        and stores everything in feedback_submissions.
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, countryCode = "pe" } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length < 2) {
      return NextResponse.json(
        { error: "Se requiere una conversación con al menos 2 mensajes" },
        { status: 400 }
      );
    }

    // Build a text representation of the conversation
    const conversationText = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "USUARIO" : "CONDOR"}: ${m.content}`
      )
      .join("\n");

    // Use AI to extract structured suggestions
    const extraction = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analiza esta conversación de feedback sobre la plataforma electoral CONDOR y extrae información estructurada.

RESPONDE ÚNICAMENTE CON JSON VÁLIDO, sin markdown ni texto adicional.

FORMATO:
{
  "raw_feedback": "Resumen de 1-2 oraciones de lo que el usuario dijo",
  "suggestions": [
    {
      "title": "Título corto de la sugerencia (max 60 chars)",
      "description": "Descripción detallada de lo que el usuario quiere o sugiere",
      "category": "ux | data | feature | bug | content | other",
      "priority": "high | medium | low"
    }
  ],
  "category": "La categoría principal del feedback (ux | data | feature | bug | content | other)",
  "sentiment": "positive | neutral | negative | mixed"
}

REGLAS:
- Extrae TODAS las sugerencias mencionadas, no solo la primera
- Si no hay sugerencias claras, el array puede estar vacío
- "category" del nivel raíz es la categoría principal del feedback general
- Sé conciso pero preciso en las descripciones`,
        },
        {
          role: "user",
          content: conversationText,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const extractedText = extraction.choices[0]?.message?.content || "{}";
    let extracted: {
      raw_feedback?: string;
      suggestions?: Array<{
        title: string;
        description: string;
        category: string;
        priority: string;
      }>;
      category?: string;
      sentiment?: string;
    };

    try {
      extracted = JSON.parse(extractedText);
    } catch {
      extracted = {
        raw_feedback: "Error al procesar feedback",
        suggestions: [],
        category: "other",
      };
    }

    // Generate ID
    const id = `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    // Store in Supabase
    const supabase = getSupabase();
    const { error } = await supabase.from("feedback_submissions").insert({
      id,
      country_code: countryCode,
      conversation: messages,
      raw_feedback: extracted.raw_feedback || "Sin resumen",
      suggestions: extracted.suggestions || [],
      category: extracted.category || "other",
      status: "pending",
    });

    if (error) {
      console.error("[feedback] Supabase insert error:", error);
      return NextResponse.json(
        { error: "Error al guardar feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      suggestions_count: (extracted.suggestions || []).length,
    });
  } catch (error) {
    console.error("[feedback] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
