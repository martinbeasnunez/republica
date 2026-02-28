// RADIOGRAFIA — Formerly contained simulated candidate data.
// All simulated data has been removed. Real verifiable profiles are now
// stored in the `candidate_profiles` Supabase table and fetched via
// lib/data/profiles.ts.

// Format currency by country — kept as a shared utility
export function formatCurrency(
  amount: number,
  countryCode: string = "pe"
): string {
  const symbol = countryCode === "co" ? "COP" : "S/";

  if (countryCode === "co") {
    if (amount >= 1_000_000_000)
      return `${symbol} ${(amount / 1_000_000_000).toFixed(1)}MM`;
    if (amount >= 1_000_000)
      return `${symbol} ${(amount / 1_000_000).toFixed(0)}M`;
    if (amount >= 1_000) return `${symbol} ${(amount / 1_000).toFixed(0)}K`;
    return `${symbol} ${amount.toLocaleString()}`;
  }
  // Peru (default)
  if (amount >= 1_000_000)
    return `S/ ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `S/ ${(amount / 1_000).toFixed(0)}K`;
  return `S/ ${amount.toLocaleString()}`;
}
