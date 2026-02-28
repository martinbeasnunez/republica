import { getSupabase } from "@/lib/supabase";

// =============================================================================
// TYPES
// =============================================================================

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
  verified: boolean;
}

export interface CareerEntry {
  role: string;
  entity: string;
  startYear: number;
  endYear: number | null;
}

export interface ControversyEntry {
  title: string;
  summary: string;
  date: string;
  sources: string[];
  severity: "alta" | "media" | "baja";
}

export interface PartyHistoryEntry {
  party: string;
  startYear: number;
  endYear: number | null;
}

export interface ProfileSource {
  url: string;
  title: string;
  date: string;
}

export interface CandidateProfile {
  id: string;
  candidateId: string;
  countryCode: string;
  biography: string | null;
  education: EducationEntry[];
  career: CareerEntry[];
  controversies: ControversyEntry[];
  legalSummary: string | null;
  partyHistory: PartyHistoryEntry[];
  previousCandidacies: number;
  yearsInPolitics: number;
  sources: ProfileSource[];
  confidence: number;
  lastResearchedAt: string | null;
  updatedAt: string;
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch a single candidate profile by candidate ID.
 */
export async function fetchCandidateProfile(
  candidateId: string
): Promise<CandidateProfile | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("candidate_id", candidateId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return mapProfile(data);
}

/**
 * Fetch all candidate profiles for a country.
 */
export async function fetchProfilesForCountry(
  countryCode: string
): Promise<CandidateProfile[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("country_code", countryCode)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapProfile);
}

// =============================================================================
// HELPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(row: any): CandidateProfile {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    countryCode: row.country_code,
    biography: row.biography ?? null,
    education: (row.education ?? []) as EducationEntry[],
    career: (row.career ?? []) as CareerEntry[],
    controversies: (row.controversies ?? []) as ControversyEntry[],
    legalSummary: row.legal_summary ?? null,
    partyHistory: (row.party_history ?? []) as PartyHistoryEntry[],
    previousCandidacies: row.previous_candidacies ?? 0,
    yearsInPolitics: row.years_in_politics ?? 0,
    sources: (row.sources ?? []) as ProfileSource[],
    confidence: row.confidence ?? 0,
    lastResearchedAt: row.last_researched_at ?? null,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}
