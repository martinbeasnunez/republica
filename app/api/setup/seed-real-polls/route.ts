import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { recalculatePollStats } from "@/lib/data/poll-utils";

/**
 * Seed REAL poll data for Peru from verified sources.
 * Also creates missing candidates if they don't exist in the DB.
 *
 * Sources:
 * - Datum (20-22 Mar 2026) via Infobae
 * - Datum (13-17 Mar 2026) via eleccionesperu2026.org
 * - IEP (6-11 Mar 2026)
 * - Ipsos (5-6 Mar 2026)
 * - CPI (28 Feb-5 Mar 2026)
 */

// IDs of ghost candidates created by broken pipeline — delete on every run
const GHOST_CANDIDATE_IDS = [
  "unknown-candidate-1", "unknown-candidate-2", "unknown-candidate-3",
  "unknown-candidate-4", "unknown-candidate-5",
];

// Candidate registry — includes NEW candidates not yet in DB
interface CandidateInfo {
  id: string;
  name: string;
  shortName: string;
  party: string;
  partyColor: string;
  ideology: string;
}

const PE_CANDIDATES: Record<string, CandidateInfo> = {
  "Lopez Aliaga": { id: "1", name: "Rafael Lopez Aliaga", shortName: "Lopez Aliaga", party: "Renovacion Popular", partyColor: "#1e3a8a", ideology: "derecha" },
  "Fujimori": { id: "2", name: "Keiko Fujimori", shortName: "K. Fujimori", party: "Fuerza Popular", partyColor: "#f97316", ideology: "derecha" },
  "Acuna": { id: "3", name: "Cesar Acuna Peralta", shortName: "C. Acuna", party: "Alianza para el Progreso", partyColor: "#16a34a", ideology: "centro" },
  "Vizcarra": { id: "4", name: "Mario Vizcarra Larios", shortName: "Vizcarra", party: "Peru Primero", partyColor: "#7c3aed", ideology: "centro" },
  "Alvarez": { id: "5", name: "Carlos Alvarez", shortName: "C. Alvarez", party: "Pais para Todos", partyColor: "#0ea5e9", ideology: "centro-izquierda" },
  "Lopez-Chau": { id: "6", name: "Alfonso Lopez-Chau", shortName: "Lopez-Chau", party: "Ahora Nacion", partyColor: "#22c55e", ideology: "centro-izquierda" },
  "Forsyth": { id: "7", name: "George Forsyth", shortName: "Forsyth", party: "Somos Peru", partyColor: "#ef4444", ideology: "centro" },
  "Luna": { id: "8", name: "Jose Luna Galvez", shortName: "Luna", party: "Podemos Peru", partyColor: "#6366f1", ideology: "centro" },
  "Grozo": { id: "wolfgang-grozo", name: "Wolfgang Mario Grozo Costa", shortName: "W. Grozo", party: "Integridad Democratica", partyColor: "#a855f7", ideology: "izquierda" },
  // NEW candidates from Datum 22-Mar
  "Nieto": { id: "jorge-nieto", name: "Jorge Nieto Montesinos", shortName: "J. Nieto", party: "Buen Gobierno", partyColor: "#0d9488", ideology: "centro-derecha" },
  "Belmont": { id: "ricardo-belmont", name: "Ricardo Belmont Cassinelli", shortName: "Belmont", party: "Peru Nacion", partyColor: "#d97706", ideology: "centro-derecha" },
  "Lescano": { id: "yonhy-lescano", name: "Yonhy Lescano Ancieta", shortName: "Lescano", party: "Accion Popular", partyColor: "#dc2626", ideology: "centro" },
  "Sanchez": { id: "roberto-sanchez", name: "Roberto Sanchez Palomino", shortName: "R. Sanchez", party: "Juntos por el Peru", partyColor: "#b91c1c", ideology: "izquierda" },
};

interface PollEntry {
  candidate: string;
  value: number;
  pollster: string;
  date: string;
}

// Real polls — verified against Infobae, eleccionesperu2026.org, RPP
const REAL_POLLS_PE: PollEntry[] = [
  // Datum (20-22 Mar 2026) — Source: Infobae 22-Mar
  { candidate: "Fujimori", value: 11.9, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Lopez Aliaga", value: 11.7, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Lopez-Chau", value: 6.5, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Alvarez", value: 5.0, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Nieto", value: 4.6, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Acuna", value: 3.6, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Grozo", value: 2.5, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Belmont", value: 2.4, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Lescano", value: 2.3, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Sanchez", value: 2.0, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Forsyth", value: 1.7, pollster: "Datum", date: "2026-03-22" },
  { candidate: "Vizcarra", value: 1.2, pollster: "Datum", date: "2026-03-22" },

  // Datum (13-17 Mar 2026) — Source: eleccionesperu2026.org
  { candidate: "Lopez Aliaga", value: 11.7, pollster: "Datum", date: "2026-03-17" },
  { candidate: "Fujimori", value: 11.9, pollster: "Datum", date: "2026-03-17" },
  { candidate: "Lopez-Chau", value: 6.5, pollster: "Datum", date: "2026-03-17" },
  { candidate: "Alvarez", value: 5.0, pollster: "Datum", date: "2026-03-17" },
  { candidate: "Acuna", value: 3.6, pollster: "Datum", date: "2026-03-17" },
  { candidate: "Grozo", value: 2.5, pollster: "Datum", date: "2026-03-17" },
  { candidate: "Vizcarra", value: 2.1, pollster: "Datum", date: "2026-03-17" },

  // IEP (6-11 Mar 2026)
  { candidate: "Lopez Aliaga", value: 11.7, pollster: "IEP", date: "2026-03-11" },
  { candidate: "Fujimori", value: 9.4, pollster: "IEP", date: "2026-03-11" },
  { candidate: "Lopez-Chau", value: 6.8, pollster: "IEP", date: "2026-03-11" },
  { candidate: "Alvarez", value: 3.9, pollster: "IEP", date: "2026-03-11" },
  { candidate: "Vizcarra", value: 3.1, pollster: "IEP", date: "2026-03-11" },
  { candidate: "Acuna", value: 2.7, pollster: "IEP", date: "2026-03-11" },
  { candidate: "Grozo", value: 2.0, pollster: "IEP", date: "2026-03-11" },

  // Ipsos (5-6 Mar 2026)
  { candidate: "Lopez Aliaga", value: 11.0, pollster: "Ipsos", date: "2026-03-06" },
  { candidate: "Fujimori", value: 10.0, pollster: "Ipsos", date: "2026-03-06" },
  { candidate: "Alvarez", value: 6.0, pollster: "Ipsos", date: "2026-03-06" },
  { candidate: "Acuna", value: 4.0, pollster: "Ipsos", date: "2026-03-06" },
  { candidate: "Lopez-Chau", value: 4.0, pollster: "Ipsos", date: "2026-03-06" },
  { candidate: "Vizcarra", value: 3.0, pollster: "Ipsos", date: "2026-03-06" },
  { candidate: "Grozo", value: 2.0, pollster: "Ipsos", date: "2026-03-06" },

  // CPI (28 Feb - 5 Mar 2026)
  { candidate: "Lopez Aliaga", value: 12.7, pollster: "CPI", date: "2026-03-05" },
  { candidate: "Fujimori", value: 8.0, pollster: "CPI", date: "2026-03-05" },
  { candidate: "Lopez-Chau", value: 5.5, pollster: "CPI", date: "2026-03-05" },
  { candidate: "Alvarez", value: 4.2, pollster: "CPI", date: "2026-03-05" },
  { candidate: "Acuna", value: 3.8, pollster: "CPI", date: "2026-03-05" },
  { candidate: "Grozo", value: 1.4, pollster: "CPI", date: "2026-03-05" },
];

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const results = {
    candidates_created: [] as string[],
    polls_deleted: 0,
    polls_inserted: 0,
    recalculated: [] as string[],
    errors: [] as string[],
  };

  try {
    // Step 0: Delete ghost candidates created by broken pipeline
    const { data: ghostsDeleted } = await supabase
      .from("candidates")
      .delete()
      .in("id", GHOST_CANDIDATE_IDS)
      .select("id");
    if (ghostsDeleted && ghostsDeleted.length > 0) {
      results.errors.push(`Cleaned ${ghostsDeleted.length} ghost candidates: ${ghostsDeleted.map((d: { id: string }) => d.id).join(", ")}`);
    }
    // Also delete any candidate with "Desconocido" or "unknown" in id/name
    const { data: moreGhosts } = await supabase
      .from("candidates")
      .delete()
      .or("id.like.unknown%,name.ilike.%desconocido%,short_name.ilike.%desconocido%")
      .select("id");
    if (moreGhosts && moreGhosts.length > 0) {
      results.errors.push(`Cleaned ${moreGhosts.length} more ghost candidates`);
    }

    // Step 1: Ensure all candidates exist in DB
    for (const [key, info] of Object.entries(PE_CANDIDATES)) {
      const { data: existing } = await supabase
        .from("candidates")
        .select("id")
        .eq("id", info.id)
        .single();

      if (!existing) {
        const { error: createErr } = await supabase.from("candidates").insert({
          id: info.id,
          slug: info.id,
          name: info.name,
          short_name: info.shortName,
          party: info.party,
          party_slug: info.party.toLowerCase().replace(/\s+/g, "-"),
          party_color: info.partyColor,
          photo: "",
          age: 0,
          profession: "",
          region: "Lima",
          ideology: info.ideology,
          bio: "",
          poll_average: 0,
          poll_trend: "stable",
          has_legal_issues: false,
          country_code: "pe",
          key_proposals: [],
        });

        if (createErr) {
          results.errors.push(`Create ${key}: ${createErr.message}`);
        } else {
          results.candidates_created.push(`${key} (${info.id})`);
        }
      }
    }

    // Step 2: Delete ALL existing PE poll data points
    const { data: deleted, error: delError } = await supabase
      .from("poll_data_points")
      .delete()
      .eq("country_code", "pe")
      .select("id");

    if (delError) {
      results.errors.push(`Delete error: ${delError.message}`);
    } else {
      results.polls_deleted = deleted?.length || 0;
    }

    // Step 3: Insert all real poll data
    for (const poll of REAL_POLLS_PE) {
      const info = PE_CANDIDATES[poll.candidate];
      if (!info) {
        results.errors.push(`Unknown candidate: ${poll.candidate}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from("poll_data_points")
        .insert({
          candidate_id: info.id,
          date: poll.date,
          value: poll.value,
          pollster: poll.pollster,
          country_code: "pe",
        });

      if (insertError) {
        results.errors.push(`Insert ${poll.candidate} ${poll.pollster} ${poll.date}: ${insertError.message}`);
      } else {
        results.polls_inserted++;
      }
    }

    // Step 4: Recalculate averages for ALL PE candidates with polls
    const uniqueIds = [...new Set(REAL_POLLS_PE.map((p) => PE_CANDIDATES[p.candidate]?.id).filter(Boolean))];
    for (const cid of uniqueIds) {
      try {
        await recalculatePollStats(supabase, cid);
        results.recalculated.push(cid);
      } catch (e) {
        results.errors.push(`Recalc ${cid}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    // Step 5: Reset candidates NOT in new polls (Forsyth, Luna, etc)
    const allIds = Object.values(PE_CANDIDATES).map((c) => c.id);
    const recalcedSet = new Set(uniqueIds);
    for (const cid of allIds) {
      if (!recalcedSet.has(cid)) {
        try {
          await recalculatePollStats(supabase, cid);
          results.recalculated.push(cid + " (reset)");
        } catch { /* OK */ }
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error", results },
      { status: 500 }
    );
  }
}
