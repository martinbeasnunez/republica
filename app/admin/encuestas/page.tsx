import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { PollAdminClient } from "./poll-admin-client";

export const dynamic = "force-dynamic";

async function fetchCandidates(country: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("candidates")
    .select("id, name, short_name, slug, poll_average, poll_trend, country_code")
    .eq("is_active", true)
    .eq("country_code", country)
    .order("poll_average", { ascending: false });
  return data || [];
}

export default async function PollAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country = "pe" } = await searchParams;
  if (!["pe", "co"].includes(country)) notFound();

  const candidates = await fetchCandidates(country);

  return <PollAdminClient candidates={candidates} country={country} />;
}
