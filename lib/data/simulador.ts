// SIMULADOR ELECTORAL — Monte Carlo Election Simulation Engine
// Runs thousands of simulated elections based on polling data + uncertainty

import { candidates } from "./candidates";

export interface SimulationConfig {
  numSimulations: number;
  volatility: number; // 0-1, how much polls can swing
  undecidedPercent: number; // % of undecided voters
  turnoutVariation: number; // % variation in turnout
}

export interface CandidateSimResult {
  candidateId: string;
  name: string;
  shortName: string;
  party: string;
  partyColor: string;
  meanVote: number;
  medianVote: number;
  minVote: number;
  maxVote: number;
  stdDev: number;
  winProbability: number; // % chance of winning
  secondRoundProbability: number; // % chance of making it to second round
  percentile5: number;
  percentile95: number;
  distribution: number[]; // histogram buckets
}

export interface SimulationResult {
  config: SimulationConfig;
  candidates: CandidateSimResult[];
  secondRoundMatchups: {
    candidate1: string;
    candidate2: string;
    probability: number;
  }[];
  timestamp: string;
  totalSimulations: number;
  blankVoteProbability: number;
}

// Box-Muller transform for normal distribution
function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Run Monte Carlo simulation
export function runSimulation(config: SimulationConfig): SimulationResult {
  const { numSimulations, volatility, undecidedPercent, turnoutVariation } = config;

  // Initialize tracking arrays
  const voteResults: Record<string, number[]> = {};
  const wins: Record<string, number> = {};
  const secondRound: Record<string, number> = {};
  const matchupCounts: Record<string, number> = {};

  candidates.forEach((c) => {
    voteResults[c.id] = [];
    wins[c.id] = 0;
    secondRound[c.id] = 0;
  });

  // Run simulations
  for (let sim = 0; sim < numSimulations; sim++) {
    const simVotes: { id: string; vote: number }[] = [];
    let totalVote = 0;

    // Generate votes for each candidate
    candidates.forEach((c) => {
      // Base: current poll average
      const base = c.pollAverage;

      // Add polling error (systematic + random)
      const pollingError = randomNormal(0, 2.5 * volatility);

      // Trend momentum
      const trendBonus =
        c.pollTrend === "up" ? randomNormal(1.0, 0.5) :
        c.pollTrend === "down" ? randomNormal(-0.8, 0.5) :
        randomNormal(0, 0.3);

      // Undecided voter allocation (random)
      const undecidedShare = (undecidedPercent / candidates.length) * (0.5 + Math.random());

      // Turnout variation effect
      const turnoutEffect = randomNormal(0, turnoutVariation * 0.5);

      // Calculate final vote
      let vote = base + pollingError + trendBonus + undecidedShare + turnoutEffect;
      vote = Math.max(0.5, vote); // minimum 0.5%

      simVotes.push({ id: c.id, vote });
      totalVote += vote;
    });

    // Normalize to ~100% (accounting for blank/null votes)
    const blankVote = Math.max(1, randomNormal(8, 3)); // Peru typically has 5-15% blank/null
    const effectiveTotal = 100 - blankVote;
    const normFactor = effectiveTotal / totalVote;

    simVotes.forEach((sv) => {
      sv.vote *= normFactor;
      voteResults[sv.id].push(sv.vote);
    });

    // Determine winner and second round
    const sorted = [...simVotes].sort((a, b) => b.vote - a.vote);
    wins[sorted[0].id]++;
    secondRound[sorted[0].id]++;
    secondRound[sorted[1].id]++;

    // Track matchup
    const matchupKey = [sorted[0].id, sorted[1].id].sort().join("-");
    matchupCounts[matchupKey] = (matchupCounts[matchupKey] || 0) + 1;
  }

  // Calculate results for each candidate
  const candidateResults: CandidateSimResult[] = candidates.map((c) => {
    const votes = voteResults[c.id].sort((a, b) => a - b);
    const n = votes.length;

    const mean = votes.reduce((a, b) => a + b, 0) / n;
    const variance = votes.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    // Create histogram (20 buckets)
    const min = votes[0];
    const max = votes[n - 1];
    const bucketSize = (max - min) / 20 || 1;
    const distribution = new Array(20).fill(0);
    votes.forEach((v) => {
      const bucket = Math.min(19, Math.floor((v - min) / bucketSize));
      distribution[bucket]++;
    });

    return {
      candidateId: c.id,
      name: c.name,
      shortName: c.shortName,
      party: c.party,
      partyColor: c.partyColor,
      meanVote: Math.round(mean * 100) / 100,
      medianVote: Math.round(votes[Math.floor(n / 2)] * 100) / 100,
      minVote: Math.round(min * 100) / 100,
      maxVote: Math.round(max * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      winProbability: Math.round((wins[c.id] / numSimulations) * 10000) / 100,
      secondRoundProbability: Math.round((secondRound[c.id] / numSimulations) * 10000) / 100,
      percentile5: Math.round(votes[Math.floor(n * 0.05)] * 100) / 100,
      percentile95: Math.round(votes[Math.floor(n * 0.95)] * 100) / 100,
      distribution,
    };
  }).sort((a, b) => b.winProbability - a.winProbability);

  // Top matchups
  const secondRoundMatchups = Object.entries(matchupCounts)
    .map(([key, count]) => {
      const [c1, c2] = key.split("-");
      const cand1 = candidates.find((c) => c.id === c1);
      const cand2 = candidates.find((c) => c.id === c2);
      return {
        candidate1: cand1?.shortName || c1,
        candidate2: cand2?.shortName || c2,
        probability: Math.round((count / numSimulations) * 10000) / 100,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10);

  return {
    config,
    candidates: candidateResults,
    secondRoundMatchups,
    timestamp: new Date().toISOString(),
    totalSimulations: numSimulations,
    blankVoteProbability: 8, // approximate
  };
}

// Default config
export const DEFAULT_CONFIG: SimulationConfig = {
  numSimulations: 10000,
  volatility: 0.5,
  undecidedPercent: 15,
  turnoutVariation: 5,
};
