import { getSupabase } from "@/lib/supabase";
import { QuizResultsClient } from "./quiz-results-client";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

export const dynamic = "force-dynamic";

interface QuizResult {
  id: string;
  country_code: string;
  answers: Record<string, number>;
  results: { candidate_id: string; candidate_name: string; compatibility: number }[];
  top_candidate_id: string;
  top_candidate_name: string;
  top_compatibility: number;
  session_id: string | null;
  created_at: string;
}

async function getQuizData(country: CountryCode) {
  const supabase = getSupabase();
  const countryConfig = COUNTRIES[country];

  const TZ_OFFSET = -5 * 60 * 60 * 1000;
  const now = new Date();
  const localNow = new Date(now.getTime() + TZ_OFFSET);
  const todayStart = new Date(
    Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()) - TZ_OFFSET
  ).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalResult,
    todayResult,
    week7dResult,
    allResultsResult,
    candidatesResult,
  ] = await Promise.all([
    // Total quiz completions
    supabase
      .from("quiz_results")
      .select("*", { count: "exact", head: true })
      .eq("country_code", country),

    // Today's completions
    supabase
      .from("quiz_results")
      .select("*", { count: "exact", head: true })
      .eq("country_code", country)
      .gte("created_at", todayStart),

    // 7-day completions
    supabase
      .from("quiz_results")
      .select("*", { count: "exact", head: true })
      .eq("country_code", country)
      .gte("created_at", sevenDaysAgo),

    // All results (last 30 days, max 1000)
    supabase
      .from("quiz_results")
      .select("id, country_code, answers, results, top_candidate_id, top_candidate_name, top_compatibility, session_id, created_at")
      .eq("country_code", country)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(1000),

    // Candidates for reference
    supabase
      .from("candidates")
      .select("id, short_name, slug, party, party_color")
      .eq("country_code", country),
  ]);

  const allResults = (allResultsResult.data || []) as QuizResult[];
  const candidates = (candidatesResult.data || []) as {
    id: string;
    short_name: string;
    slug: string;
    party: string;
    party_color: string;
  }[];

  // ── Daily completions (30d) ──
  const dailyCompletions: Record<string, number> = {};
  for (const r of allResults) {
    const localDate = new Date(new Date(r.created_at).getTime() + TZ_OFFSET);
    const day = localDate.toISOString().split("T")[0];
    dailyCompletions[day] = (dailyCompletions[day] || 0) + 1;
  }
  const dailyData: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(localNow.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyData.push({ date: key, count: dailyCompletions[key] || 0 });
  }

  // ── Top candidate winners (how often each candidate is #1) ──
  const winCounts: Record<string, number> = {};
  for (const r of allResults) {
    const name = r.top_candidate_name || "Desconocido";
    winCounts[name] = (winCounts[name] || 0) + 1;
  }
  const topWinners = Object.entries(winCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => {
      const cand = candidates.find(
        (c) => c.short_name === name
      );
      return {
        name,
        count,
        pct: allResults.length > 0 ? Math.round((count / allResults.length) * 100) : 0,
        partyColor: cand?.party_color || "#6366f1",
        party: cand?.party || "",
      };
    });

  // ── Average compatibility of top match ──
  const avgCompatibility =
    allResults.length > 0
      ? Math.round(
          allResults.reduce((sum, r) => sum + (r.top_compatibility || 0), 0) /
            allResults.length
        )
      : 0;

  // ── Answer distribution per question ──
  const questionIds = [
    "pena-muerte",
    "estado-empresario",
    "inversion-extranjera",
    "mineria",
    "aborto",
    "matrimonio-igualitario",
    "descentralizacion",
    "educacion-publica",
    "salud-universal",
    "corrupcion",
  ];
  const questionLabels: Record<string, string> = {
    "pena-muerte": "Pena de muerte",
    "estado-empresario": "Estado empresario",
    "inversion-extranjera": "Inversión extranjera",
    "mineria": "Expansión minera",
    "aborto": "Despenalizar aborto",
    "matrimonio-igualitario": "Matrimonio igualitario",
    "descentralizacion": "Descentralización",
    "educacion-publica": "Presupuesto educación",
    "salud-universal": "Salud universal",
    "corrupcion": "Anticorrupción",
  };

  const answerDistribution = questionIds.map((qId) => {
    const dist: Record<number, number> = { [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0 };
    for (const r of allResults) {
      const answer = r.answers[qId];
      if (answer !== undefined && dist[answer] !== undefined) {
        dist[answer]++;
      }
    }
    return {
      questionId: qId,
      label: questionLabels[qId] || qId,
      distribution: dist,
      total: Object.values(dist).reduce((a, b) => a + b, 0),
    };
  });

  // ── Recent results (last 20) ──
  const recentResults = allResults.slice(0, 20).map((r) => ({
    id: r.id,
    topCandidate: r.top_candidate_name || "—",
    compatibility: r.top_compatibility,
    createdAt: r.created_at,
    answersCount: Object.keys(r.answers).length,
  }));

  return {
    country,
    countryName: countryConfig.name,
    countryEmoji: countryConfig.emoji,
    total: totalResult.count || 0,
    today: todayResult.count || 0,
    week7d: week7dResult.count || 0,
    dailyData,
    topWinners,
    avgCompatibility,
    answerDistribution,
    recentResults,
  };
}

export default async function AdminQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: countryParam } = await searchParams;
  const country = (countryParam === "co" ? "co" : "pe") as CountryCode;

  let data;
  try {
    data = await getQuizData(country);
  } catch (err) {
    console.error("[admin/quiz] Error:", err);
    data = {
      country,
      countryName: COUNTRIES[country].name,
      countryEmoji: COUNTRIES[country].emoji,
      total: 0,
      today: 0,
      week7d: 0,
      dailyData: [],
      topWinners: [],
      avgCompatibility: 0,
      answerDistribution: [],
      recentResults: [],
    };
  }

  return <QuizResultsClient data={data} />;
}
