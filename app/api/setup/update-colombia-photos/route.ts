import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/setup/update-colombia-photos
 *
 * Updates Colombian candidate photos to verified Wikimedia Commons images.
 * Source: Wikidata P18 property → Wikimedia Commons thumbnails (400px).
 * Auth: Bearer CRON_SECRET
 */

const PHOTO_MAP: Record<string, string> = {
  "co-ivan-cepeda":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Ivan_Cepeda_Congreso.jpg/400px-Ivan_Cepeda_Congreso.jpg",
  "co-abelardo-de-la-espriella":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/ADLE_OFICIAL.webp/400px-ADLE_OFICIAL.webp",
  "co-claudia-lopez":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Claudia_L%C3%B3pez.png/400px-Claudia_L%C3%B3pez.png",
  "co-sergio-fajardo":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/SergioFajardo.jpg/400px-SergioFajardo.jpg",
  "co-paloma-valencia":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Paloma_Valencia.png/400px-Paloma_Valencia.png",
  "co-vicky-davila":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Vicky_Davila_2025.jpg/400px-Vicky_Davila_2025.jpg",
  "co-daniel-quintero":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Daniel_Quintero.jpg/400px-Daniel_Quintero.jpg",
  "co-roy-barreras":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/RoyBarreras.jpg/400px-RoyBarreras.jpg",
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
