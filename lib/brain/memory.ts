import type { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

interface BrainActionRow {
  id: string;
  run_id: string;
  job: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  confidence: number | null;
  country_code: string;
  created_at: string;
}

// =============================================================================
// MEMORY QUERIES
// =============================================================================

/**
 * Get recent brain actions for a specific entity and job.
 * Used to give the AI context about what it already did for this entity.
 */
export async function getEntityMemory(
  supabase: SupabaseClient,
  entityId: string,
  job: string,
  days: number = 14
): Promise<BrainActionRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("brain_actions")
    .select("*")
    .eq("entity_id", entityId)
    .eq("job", job)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.log(`[brain][memory] Error fetching memory for ${entityId}: ${error.message}`);
    return [];
  }

  return (data || []) as BrainActionRow[];
}

/**
 * Get recent flags grouped by entity_id.
 * Used by poll-verifier to skip already-flagged anomalies.
 */
export async function getRecentFlags(
  supabase: SupabaseClient,
  job: string,
  countryCode: string,
  days: number = 7
): Promise<Map<string, BrainActionRow[]>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("brain_actions")
    .select("*")
    .eq("job", job)
    .eq("action_type", "flag")
    .eq("country_code", countryCode)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.log(`[brain][memory] Error fetching recent flags: ${error.message}`);
    return new Map();
  }

  const map = new Map<string, BrainActionRow[]>();
  for (const action of (data || []) as BrainActionRow[]) {
    const key = action.entity_id || "unknown";
    const existing = map.get(key) || [];
    existing.push(action);
    map.set(key, existing);
  }

  return map;
}

/**
 * Format recent brain actions as human-readable text for AI prompt injection.
 * Gives the AI context about what it previously did for a candidate.
 */
export function formatMemoryForPrompt(actions: BrainActionRow[]): string {
  if (actions.length === 0) return "No hay acciones previas para este candidato.";

  const lines = actions.slice(0, 10).map((a) => {
    const date = new Date(a.created_at).toISOString().split("T")[0];
    const before = a.before_value ? JSON.stringify(a.before_value) : "N/A";
    const after = a.after_value ? JSON.stringify(a.after_value) : "N/A";
    return `- [${date}] ${a.action_type.toUpperCase()}: ${a.description}\n  Antes: ${before}\n  Después: ${after}`;
  });

  return lines.join("\n");
}
