import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/setup/update-colombia-photos
 *
 * Updates Colombian candidate photos from placeholder local paths
 * to external URLs from candidatos.colombia2026.com.
 * Auth: Bearer CRON_SECRET
 */

const PHOTO_MAP: Record<string, string> = {
  "co-ivan-cepeda":
    "https://candidatos.colombia2026.com/candidates/webp/ivan-cepeda.webp",
  "co-abelardo-de-la-espriella":
    "https://candidatos.colombia2026.com/candidates/webp/abelardo-de-la-espriella.webp",
  "co-claudia-lopez":
    "https://candidatos.colombia2026.com/candidates/webp/claudia-lopez.webp",
  "co-sergio-fajardo":
    "https://candidatos.colombia2026.com/candidates/webp/sergio-fajardo.webp",
  "co-paloma-valencia":
    "https://candidatos.colombia2026.com/candidates/webp/paloma-valencia.webp",
  "co-vicky-davila":
    "https://candidatos.colombia2026.com/candidates/webp/vicky-davila.webp",
  "co-daniel-quintero":
    "https://candidatos.colombia2026.com/candidates/webp/daniel-quintero.webp",
  "co-roy-barreras":
    "https://candidatos.colombia2026.com/candidates/webp/roy-barreras.webp",
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const results: Array<{ id: string; status: string }> = [];

  for (const [candidateId, photoUrl] of Object.entries(PHOTO_MAP)) {
    const { error } = await supabase
      .from("candidates")
      .update({
        photo: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", candidateId);

    if (error) {
      console.error(
        `[update-colombia-photos] Error updating ${candidateId}:`,
        error
      );
      results.push({ id: candidateId, status: `error: ${error.message}` });
    } else {
      results.push({ id: candidateId, status: "updated" });
    }
  }

  const successCount = results.filter((r) => r.status === "updated").length;

  return NextResponse.json({
    success: true,
    updated: successCount,
    total: results.length,
    results,
  });
}
