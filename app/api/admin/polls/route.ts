import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import { recalculatePollStats } from "@/lib/data/poll-utils";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("condor_admin_session")?.value;
  if (!session || session !== process.env.ADMIN_SESSION_SECRET) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const country = request.nextUrl.searchParams.get("country") || "pe";
    const supabase = getSupabase();
    const { data: polls, error } = await supabase
      .from("poll_data_points")
      .select("*")
      .eq("country_code", country)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ polls });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { candidate_id, date, value, pollster, country_code: bodyCountryCode } = body;

    if (!candidate_id || !date || value === undefined || !pollster) {
      return NextResponse.json(
        { error: "Missing required fields: candidate_id, date, value, pollster" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Resolve country_code: body > candidate lookup > default "pe"
    let country_code = bodyCountryCode;
    if (!country_code) {
      const { data: cand } = await supabase
        .from("candidates")
        .select("country_code")
        .eq("id", candidate_id)
        .single();
      country_code = cand?.country_code || "pe";
    }

    // Insert the new poll data point
    const { data: poll, error: insertError } = await supabase
      .from("poll_data_points")
      .insert({ candidate_id, date, value, pollster, country_code })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Recalculate poll_average and poll_trend using weighted recency average
    try {
      await recalculatePollStats(supabase, candidate_id);
    } catch (recalcError) {
      return NextResponse.json(
        { error: recalcError instanceof Error ? recalcError.message : "Failed to recalculate stats" },
        { status: 500 }
      );
    }

    return NextResponse.json({ poll }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing poll data point id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("poll_data_points")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
