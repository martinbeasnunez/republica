import { NextRequest } from "next/server";
import { getOpenAI, SYSTEM_PROMPTS } from "@/lib/ai/openai";
import { candidates } from "@/lib/data/candidates";
import { getNewsContext } from "@/lib/data/news";

// Build candidate context for the AI
function getCandidateContext(): string {
  return candidates
    .map(
      (c) =>
        `- ${c.name} (${c.party}, ${c.ideology}): ${c.profession}, ${c.age} anos, region ${c.region}. Encuesta: ${c.pollAverage}%. ${c.bio}. Propuestas clave: ${c.keyProposals.map((p) => p.title).join(", ")}.${c.hasLegalIssues ? ` NOTA LEGAL: ${c.legalNote}` : ""}`
    )
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Se requiere un array de mensajes" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const candidateContext = getCandidateContext();
    const newsContext = getNewsContext();

    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPTS.electoralAssistant}\n\nCANDIDATOS REGISTRADOS:\n${candidateContext}\n\nNOTICIAS VERIFICADAS EN LA PLATAFORMA CONDOR (febrero 2026):\n${newsContext}`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    });

    // Create a ReadableStream from the OpenAI stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
