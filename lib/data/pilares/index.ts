// Country-aware accessor for pilares data
import type { CountryCode } from "@/lib/config/countries";
import type {
  DevelopmentPillar,
  PeruRanking,
  EconomicIndicator,
  BenchmarkCountry,
} from "../pilares-desarrollo";

import {
  developmentPillars as peruPillars,
  peruRankings,
  peruEconomicIndicators,
  benchmarkCountries as peruBenchmarks,
  internationalFrameworks,
} from "../pilares-desarrollo";

import {
  colombiaPillars,
  colombiaRankings,
  colombiaEconomicIndicators,
  colombiaBenchmarkCountries,
} from "../pilares-colombia";

export function getCountryPillars(code: CountryCode): DevelopmentPillar[] {
  return code === "co" ? colombiaPillars : peruPillars;
}

export function getCountryRankings(code: CountryCode): PeruRanking[] {
  return code === "co" ? colombiaRankings : peruRankings;
}

export function getCountryEconomicIndicators(code: CountryCode): EconomicIndicator[] {
  return code === "co" ? colombiaEconomicIndicators : peruEconomicIndicators;
}

export function getCountryBenchmarks(code: CountryCode): BenchmarkCountry[] {
  return code === "co" ? colombiaBenchmarkCountries : peruBenchmarks;
}

// Re-export frameworks (same for all countries)
export { internationalFrameworks };

// Re-export types and helpers
export { getPillarScoreColor, getPillarScoreLabel } from "../pilares-desarrollo";
export type { DevelopmentPillar, PeruRanking, EconomicIndicator, BenchmarkCountry } from "../pilares-desarrollo";
