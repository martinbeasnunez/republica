import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { logAction } from "@/lib/brain/audit";

// =============================================================================
// TYPES
// =============================================================================

interface PollDataPoint {
  id: string;
  candidate_id: string;
  value: number;
  pollster: string;
  date: string;
  country_code: string;
}

interface PollAnomaly {
  type: "spike" | "outlier" | "duplicate" | "suspicious_pollster" | "out_of_range";
  poll: PollDataPoint;
  reason: string;
  severity: "high" | "medium" | "low";
  candidate_name: string;
}

export interface PollVerifierResult {
  analyzed: number;
  anomalies: number;
  flagged: number;
  removed: number;
  errors: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Max % change between consecutive polls to flag as spike */
const SPIKE_THRESHOLD = 5.0;

/** Min/max valid poll values */
const MIN_POLL_VALUE = 0.3;
const MAX_POLL_VALUE = 50.0;

/** Known valid pollsters by country */
const VALID_POLLSTERS: Record<string, string[]> = {
  pe: ["ipsos", "datum", "iep", "cpi"],
  co: ["invamer", "yancep", "cifras y conceptos", "centro nacional de consultoria", "datexco", "guarumo", "cnc"],
};

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * Poll Verifier Job
 *
 * Cross-verifies poll data to detect:
 * - Sudden spikes (>5% change between consecutive polls)
 * - Outlier values (way above/below candidate's average)
 * - Duplicate entries (same pollster + date + candidate)
 * - Suspicious pollsters (not in recognized list)
 * - Out-of-range values (<0.3% or >50%)
 *
 * Flags anomalies in the audit trail. Removes clear duplicates.
 */
export async function runPollVerifier(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<PollVerifierResult> {
  const result: PollVerifierResult = {
    analyzed: 0,
    anomalies: 0,
    flagged: 0,
    removed: 0,
    errors: 0,
  };

  try {
    console.log(`[brain][poll-verifier][${countryCode}] Starting...`);

    // ─── 1. Fetch all active candidates ─────────────────────
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, short_name, poll_average")
      .eq("is_active", true)
      .eq("country_code", countryCode);

    if (!candidates || candidates.length === 0) return result;

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    // ─── 2. Fetch recent polls (last 30 days) ───────────────
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: polls } = await supabase
      .from("poll_data_points")
      .select("*")
      .eq("country_code", countryCode)
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: true });

    if (!polls || polls.length === 0) {
      console.log(`[brain][poll-verifier][${countryCode}] No recent polls`);
      return result;
    }

    result.analyzed = polls.length;
    const anomalies: PollAnomaly[] = [];

    // ─── 3. Group polls by candidate ────────────────────────
    const pollsByCandidate = new Map<string, PollDataPoint[]>();
    for (const p of polls) {
      const existing = pollsByCandidate.get(p.candidate_id) || [];
      existing.push(p);
      pollsByCandidate.set(p.candidate_id, existing);
    }

    // ─── 4. Check each candidate's polls ────────────────────
    const validPollsters = VALID_POLLSTERS[countryCode] || [];

    for (const [candidateId, candidatePolls] of pollsByCandidate) {
      const candidate = candidateMap.get(candidateId);
      if (!candidate) continue;
      const name = candidate.short_name;

      // Sort by date
      const sorted = [...candidatePolls].sort(
        (a, b) => a.date.localeCompare(b.date)
      );

      // Check for duplicates (same candidate + pollster + date)
      const seen = new Map<string, PollDataPoint>();
      for (const p of sorted) {
        const key = `${p.candidate_id}:${p.pollster}:${p.date}`;
        if (seen.has(key)) {
          const existing = seen.get(key)!;
          if (existing.value !== p.value) {
            anomalies.push({
              type: "duplicate",
              poll: p,
              reason: `Duplicado con valores diferentes: ${existing.value}% vs ${p.value}% (${p.pollster}, ${p.date})`,
              severity: "high",
              candidate_name: name,
            });
          } else {
            // Exact duplicate — mark for removal
            anomalies.push({
              type: "duplicate",
              poll: p,
              reason: `Duplicado exacto: ${p.value}% (${p.pollster}, ${p.date})`,
              severity: "low",
              candidate_name: name,
            });
          }
        }
        seen.set(key, p);
      }

      // Check for spikes
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const diff = Math.abs(curr.value - prev.value);

        if (diff >= SPIKE_THRESHOLD) {
          anomalies.push({
            type: "spike",
            poll: curr,
            reason: `Cambio de ${diff.toFixed(1)}pp en ${curr.date}: ${prev.value}% → ${curr.value}% (${curr.pollster})`,
            severity: diff >= SPIKE_THRESHOLD * 2 ? "high" : "medium",
            candidate_name: name,
          });
        }
      }

      // Check for out-of-range values
      for (const p of sorted) {
        if (p.value < MIN_POLL_VALUE || p.value > MAX_POLL_VALUE) {
          anomalies.push({
            type: "out_of_range",
            poll: p,
            reason: `Valor fuera de rango: ${p.value}% (rango valido: ${MIN_POLL_VALUE}-${MAX_POLL_VALUE}%)`,
            severity: "high",
            candidate_name: name,
          });
        }
      }

      // Check for suspicious pollsters
      for (const p of sorted) {
        const pollsterLower = p.pollster.toLowerCase().replace(/\s*\(estimado\)\s*/g, "").trim();
        if (pollsterLower && !validPollsters.some((vp) => pollsterLower.includes(vp))) {
          // Only flag non-estimated polls from unknown pollsters
          if (!p.pollster.includes("estimado")) {
            anomalies.push({
              type: "suspicious_pollster",
              poll: p,
              reason: `Encuestadora no reconocida: "${p.pollster}" (reconocidas: ${validPollsters.join(", ")})`,
              severity: "medium",
              candidate_name: name,
            });
          }
        }
      }

      // Check for outliers (>2x standard deviation from mean)
      if (sorted.length >= 4) {
        const values = sorted.map((p) => p.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        );

        if (stdDev > 0.5) {
          for (const p of sorted) {
            const zScore = Math.abs(p.value - mean) / stdDev;
            if (zScore > 2.5) {
              anomalies.push({
                type: "outlier",
                poll: p,
                reason: `Valor atipico: ${p.value}% (promedio: ${mean.toFixed(1)}%, z-score: ${zScore.toFixed(1)})`,
                severity: zScore > 3 ? "high" : "medium",
                candidate_name: name,
              });
            }
          }
        }
      }
    }

    result.anomalies = anomalies.length;

    // ─── 5. Process anomalies ───────────────────────────────
    // Remove exact duplicates (low severity)
    const exactDupes = anomalies.filter(
      (a) => a.type === "duplicate" && a.severity === "low"
    );
    for (const dupe of exactDupes) {
      const { error } = await supabase
        .from("poll_data_points")
        .delete()
        .eq("id", dupe.poll.id);

      if (!error) {
        result.removed++;
      }
    }

    // Flag significant anomalies in audit trail
    const significantAnomalies = anomalies.filter(
      (a) => a.severity === "high" || a.severity === "medium"
    );

    for (const anomaly of significantAnomalies.slice(0, 10)) {
      await logAction(supabase, {
        run_id: runId,
        job: "data-integrity",
        action_type: "flag",
        entity_type: "poll",
        entity_id: anomaly.poll.candidate_id,
        description: `[POLL ${anomaly.type.toUpperCase()}] ${anomaly.candidate_name}: ${anomaly.reason}`,
        before_value: {
          value: anomaly.poll.value,
          pollster: anomaly.poll.pollster,
          date: anomaly.poll.date,
        },
        confidence: anomaly.severity === "high" ? 0.9 : 0.6,
        country_code: countryCode,
      });
      result.flagged++;
    }

    console.log(
      `[brain][poll-verifier][${countryCode}] Done: ${result.analyzed} analyzed, ${result.anomalies} anomalies, ${result.flagged} flagged, ${result.removed} dupes removed`
    );

    return result;
  } catch (err) {
    console.error(`[brain][poll-verifier][${countryCode}] Fatal error:`, err);
    result.errors++;
    return result;
  }
}
