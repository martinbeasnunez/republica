import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";

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
    const { candidate_id, date, value, pollster } = body;

    if (!candidate_id || !date || value === undefined || !pollster) {
      return NextResponse.json(
        { error: "Missing required fields: candidate_id, date, value, pollster" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Insert the new poll data point
    const { data: poll, error: insertError } = await supabase
      .from("poll_data_points")
      .insert({ candidate_id, date, value, pollster })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Recalculate poll_average and poll_trend for this candidate
    const { data: recentPolls, error: fetchError } = await supabase
      .from("poll_data_points")
      .select("value")
      .eq("candidate_id", candidate_id)
      .order("date", { ascending: false })
      .limit(3);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (recentPolls && recentPolls.length > 0) {
      // Calculate poll_average from the last 3 data points
      const poll_average =
        recentPolls.reduce((sum, p) => sum + p.value, 0) / recentPolls.length;

      // Calculate poll_trend based on latest vs second-latest
      let poll_trend: "up" | "down" | "stable" = "stable";
      if (recentPolls.length >= 2) {
        const latest = recentPolls[0].value;
        const secondLatest = recentPolls[1].value;
        if (latest > secondLatest) {
          poll_trend = "up";
        } else if (latest < secondLatest) {
          poll_trend = "down";
        }
      }

      // Update the candidate record
      const { error: updateError } = await supabase
        .from("candidates")
        .update({
          poll_average: Math.round(poll_average * 100) / 100,
          poll_trend,
        })
        .eq("id", candidate_id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
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
