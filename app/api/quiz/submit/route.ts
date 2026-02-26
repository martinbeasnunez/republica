import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country_code,
      answers,
      results,
      top_candidate_id,
      top_candidate_name,
      top_compatibility,
      session_id,
    } = body;

    if (!country_code || !answers || !results || !top_candidate_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        country_code,
        answers,
        results,
        top_candidate_id,
        top_candidate_name: top_candidate_name || null,
        top_compatibility: top_compatibility || 0,
        session_id: session_id || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[quiz/submit] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save quiz results" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("[quiz/submit] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
