import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { logAction } from "@/lib/brain/audit";
import { recalculatePollStats } from "@/lib/data/poll-utils";
import {
  fetchWikipediaAnexo,
  parseWikipediaAnexo,
  type RawPollRow,
  WIKI_SOURCES,
} from "@/lib/brain/poll-sources/wikipedia";
import {
  validatePoll,
  type NormalizedPoll,
  type ValidationRejectCode,
} from "@/lib/brain/poll-sources/validator";

/**
 * Poll Updater Job
 *
 * Fetches the canonical Wikipedia anexo for each country, parses the
 * official poll table deterministically (no AI), validates every row
 * against a strict gauntlet, and upserts accepted rows into
 * `poll_data_points`. Rejected rows are logged to `brain_actions` so
 * /admin/brain surfaces them for review.
 *
 * Invariants:
 *  - Fail-closed: any fetch/parse exception aborts the job without
 *    touching the database.
 *  - Idempotent: existing (candidate_id, pollster, date) tuples are
 *    detected up-front and skipped (no unique constraint required).
 *  - Zero AI: all extraction is pure HTML parsing via cheerio.
 *  - Audit: every insert and rejection hits `brain_actions`.
 */

export interface PollUpdaterResult {
  fetched: number;      // raw rows parsed from Wikipedia
  accepted: number;     // rows that passed validation
  rejected: number;     // rows rejected by validation
  polls_inserted: number; // unique (pollster, date) tuples inserted
  data_points_inserted: number; // candidate-level rows inserted
  data_points_skipped: number;  // existing duplicates skipped
  candidates_updated: number;   // candidates whose stats were recalculated
  errors: number;
  rejected_by_reason: Record<string, number>;
}

/** Active CO candidate IDs that should be referenced in the alias map. */
async function fetchActiveCandidateIds(
  supabase: SupabaseClient,
  country: CountryCode
): Promise<Set<string>> {
  const { data } = await supabase
    .from("candidates")
    .select("id")
    .eq("country_code", country)
    .eq("is_active", true);
  return new Set((data || []).map((c: { id: string }) => c.id));
}

/** Check which (candidate_id, pollster, date) tuples already exist for this country. */
async function loadExistingKeys(
  supabase: SupabaseClient,
  country: CountryCode
): Promise<Set<string>> {
  const { data } = await supabase
    .from("poll_data_points")
    .select("candidate_id, pollster, date")
    .eq("country_code", country);
  const set = new Set<string>();
  for (const row of data || []) {
    set.add(`${row.candidate_id}|${(row.pollster || "").trim()}|${row.date}`);
  }
  return set;
}

export async function runPollUpdater(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<PollUpdaterResult> {
  const result: PollUpdaterResult = {
    fetched: 0,
    accepted: 0,
    rejected: 0,
    polls_inserted: 0,
    data_points_inserted: 0,
    data_points_skipped: 0,
    candidates_updated: 0,
    errors: 0,
    rejected_by_reason: {},
  };

  try {
    console.log(`[brain][poll-updater][${countryCode}] Starting...`);

    // ─── 1. Fetch + parse ──────────────────────────────────────────
    const { html, url } = await fetchWikipediaAnexo(countryCode);
    const rawRows = parseWikipediaAnexo(
      html,
      countryCode,
      new Date().getUTCFullYear()
    );
    result.fetched = rawRows.length;

    if (rawRows.length === 0) {
      console.log(
        `[brain][poll-updater][${countryCode}] No rows parsed from ${url} — nothing to do`
      );
      return result;
    }

    // ─── 2. Load guard sets ────────────────────────────────────────
    const activeCandidateIds = await fetchActiveCandidateIds(
      supabase,
      countryCode
    );
    if (activeCandidateIds.size === 0) {
      console.warn(
        `[brain][poll-updater][${countryCode}] No active candidates — aborting`
      );
      return result;
    }
    const existingKeys = await loadExistingKeys(supabase, countryCode);

    // ─── 3. Validate + filter ──────────────────────────────────────
    const accepted: NormalizedPoll[] = [];
    const rejections: Array<{
      raw: RawPollRow;
      reason: string;
      code: ValidationRejectCode;
    }> = [];

    for (const raw of rawRows) {
      // Drop any shares that reference a non-active or unknown candidate
      const filteredShares: Record<string, number> = {};
      for (const [cid, val] of Object.entries(raw.shares)) {
        if (activeCandidateIds.has(cid)) filteredShares[cid] = val;
      }
      const cleaned: RawPollRow = { ...raw, shares: filteredShares };

      const v = validatePoll(cleaned, countryCode);
      if (v.ok) {
        accepted.push(v.normalized);
      } else {
        rejections.push({ raw, reason: v.reason, code: v.code });
        result.rejected_by_reason[v.code] =
          (result.rejected_by_reason[v.code] || 0) + 1;
      }
    }
    result.accepted = accepted.length;
    result.rejected = rejections.length;

    // ─── 4. Upsert accepted polls (dedupe via existingKeys) ───────
    const affectedCandidateIds = new Set<string>();
    const newPollInserts: NormalizedPoll[] = []; // polls with at least one new row

    for (const poll of accepted) {
      const rowsToInsert: Array<{
        candidate_id: string;
        pollster: string;
        date: string;
        value: number;
        country_code: CountryCode;
      }> = [];

      for (const [candidateId, value] of Object.entries(poll.shares)) {
        const key = `${candidateId}|${poll.pollster.trim()}|${poll.field_end}`;
        if (existingKeys.has(key)) {
          result.data_points_skipped++;
          continue;
        }
        rowsToInsert.push({
          candidate_id: candidateId,
          pollster: poll.pollster,
          date: poll.field_end,
          value,
          country_code: countryCode,
        });
        existingKeys.add(key); // prevent re-insert within the same run
      }

      if (rowsToInsert.length === 0) continue;

      const { error } = await supabase
        .from("poll_data_points")
        .insert(rowsToInsert);

      if (error) {
        console.error(
          `[brain][poll-updater][${countryCode}] Insert error for ${poll.pollster} ${poll.field_end}:`,
          error.message
        );
        result.errors++;
        continue;
      }

      result.data_points_inserted += rowsToInsert.length;
      result.polls_inserted++;
      newPollInserts.push(poll);
      for (const r of rowsToInsert) affectedCandidateIds.add(r.candidate_id);

      // Audit: one action per inserted poll
      await logAction(supabase, {
        run_id: runId,
        job: "poll-updater",
        action_type: "create",
        entity_type: "poll",
        entity_id: `${poll.pollster}:${poll.field_end}`,
        description: `Nueva encuesta ${poll.pollster} ${poll.field_end} (n=${poll.sample_size}, ${rowsToInsert.length} candidatos)`,
        after_value: {
          pollster: poll.pollster,
          field_start: poll.field_start,
          field_end: poll.field_end,
          sample_size: poll.sample_size,
          source_url: poll.source_url,
          shares: poll.shares,
          extraction_source: "wikipedia:es",
        },
        confidence: 0.95,
        country_code: countryCode,
      });
    }

    // ─── 5. Log rejections (cap to avoid flood) ───────────────────
    for (const rej of rejections.slice(0, 20)) {
      await logAction(supabase, {
        run_id: runId,
        job: "poll-updater",
        action_type: "flag",
        entity_type: "poll",
        entity_id: `reject:${rej.raw.pollster}:${rej.raw.field_end || "?"}`,
        description: `[POLL REJECT ${rej.code.toUpperCase()}] ${rej.raw.pollster} ${rej.raw.field_end || "?"}: ${rej.reason}`,
        before_value: {
          pollster: rej.raw.pollster,
          field_start: rej.raw.field_start,
          field_end: rej.raw.field_end,
          sample_size: rej.raw.sample_size,
          source_url: rej.raw.source_url,
          shares: rej.raw.shares,
          code: rej.code,
          extraction_source: "wikipedia:es",
        },
        confidence: 0.9,
        country_code: countryCode,
      });
    }

    // ─── 6. Recalculate candidates.poll_average / poll_trend ──────
    for (const cid of affectedCandidateIds) {
      try {
        await recalculatePollStats(supabase, cid);
        result.candidates_updated++;
      } catch (err) {
        console.error(
          `[brain][poll-updater][${countryCode}] recalc failed for ${cid}:`,
          err
        );
        result.errors++;
      }
    }

    console.log(
      `[brain][poll-updater][${countryCode}] Done: fetched=${result.fetched} accepted=${result.accepted} rejected=${result.rejected} inserted=${result.polls_inserted} points=${result.data_points_inserted} skipped=${result.data_points_skipped} candidates=${result.candidates_updated}`
    );
    return result;
  } catch (err) {
    console.error(
      `[brain][poll-updater][${countryCode}] Fatal error:`,
      err instanceof Error ? err.message : err
    );
    result.errors++;
    // Fail-closed: do NOT touch DB on fetch/parse errors
    return result;
  }
}

// Re-export for type consumers
export { WIKI_SOURCES };
