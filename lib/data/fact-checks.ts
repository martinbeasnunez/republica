import { getSupabase } from "@/lib/supabase";

export interface FactCheck {
  id: string;
  claim: string;
  verdict: "VERDADERO" | "PARCIALMENTE_VERDADERO" | "ENGANOSO" | "FALSO" | "NO_VERIFICABLE";
  explanation: string;
  sources: string[];
  sourceUrls: string[];
  confidence: number;
  context: string;
  claimant: string;
  claimOrigin: string;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToFactCheck(row: any): FactCheck {
  return {
    id: row.id,
    claim: row.claim,
    verdict: row.verdict,
    explanation: row.explanation,
    sources: row.sources || [],
    sourceUrls: row.source_urls || [],
    confidence: row.confidence || 0,
    context: row.context || "",
    claimant: row.claimant || "Desconocido",
    claimOrigin: row.claim_origin || "",
    createdAt: row.created_at,
  };
}

export async function fetchFactChecks(limit = 50): Promise<FactCheck[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("fact_checks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching fact checks:", error);
      return [];
    }

    return (data || []).map(mapDbToFactCheck);
  } catch {
    console.error("Failed to fetch fact checks");
    return [];
  }
}

export async function fetchFactCheckStats(): Promise<{
  total: number;
  falsas: number;
  verdaderas: number;
  parciales: number;
}> {
  const checks = await fetchFactChecks(200);
  return {
    total: checks.length,
    falsas: checks.filter((c) => c.verdict === "FALSO").length,
    verdaderas: checks.filter((c) => c.verdict === "VERDADERO").length,
    parciales: checks.filter(
      (c) => c.verdict === "PARCIALMENTE_VERDADERO" || c.verdict === "ENGANOSO"
    ).length,
  };
}
