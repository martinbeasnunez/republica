import { getSupabase } from "@/lib/supabase";
import { FeedbackAdminClient } from "./feedback-admin-client";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

export const dynamic = "force-dynamic";

// =============================================================================
// TYPES
// =============================================================================

interface FeedbackSubmission {
  id: string;
  country_code: string;
  conversation: Array<{ role: string; content: string }>;
  raw_feedback: string;
  suggestions: Array<{
    title: string;
    description: string;
    category: string;
    priority: string;
  }>;
  category: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

// =============================================================================
// DATA FETCHING
// =============================================================================

async function fetchFeedback(
  countryCode: string
): Promise<FeedbackSubmission[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback_submissions")
      .select("*")
      .eq("country_code", countryCode)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[admin/feedback] Error fetching:", error);
      return [];
    }

    return (data || []) as FeedbackSubmission[];
  } catch {
    return [];
  }
}

// =============================================================================
// PAGE
// =============================================================================

export default async function FeedbackAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: countryParam } = await searchParams;
  const countryCode = (countryParam || "pe") as CountryCode;
  const countryConfig = COUNTRIES[countryCode] || COUNTRIES.pe;

  const feedback = await fetchFeedback(countryCode);

  // Compute stats
  const stats = {
    total: feedback.length,
    pending: feedback.filter((f) => f.status === "pending").length,
    reviewed: feedback.filter((f) => f.status === "reviewed").length,
    approved: feedback.filter((f) => f.status === "approved").length,
    rejected: feedback.filter((f) => f.status === "rejected").length,
    totalSuggestions: feedback.reduce(
      (sum, f) => sum + (f.suggestions?.length || 0),
      0
    ),
  };

  return (
    <FeedbackAdminClient
      feedback={feedback}
      stats={stats}
      country={countryConfig}
    />
  );
}
