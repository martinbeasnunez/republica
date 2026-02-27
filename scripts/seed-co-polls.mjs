/**
 * Seed Colombia poll data from multiple real sources.
 * Sources:
 *   - Guarumo/Ecoanalítica (Jan 22, 2026) - El Tiempo / El Colombiano
 *   - CELAG Data (Feb 24, 2026) - Infobae Colombia
 *   - GAD3 (Feb 27, 2026) - 360 Radio Colombia
 */

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const polls = [
  // === Guarumo / Ecoanalítica — Jan 22, 2026 ===
  { candidate_id: "co-ivan-cepeda", date: "2026-01-22", value: 33.6, pollster: "Guarumo" },
  { candidate_id: "co-abelardo-de-la-espriella", date: "2026-01-22", value: 18.2, pollster: "Guarumo" },
  { candidate_id: "co-paloma-valencia", date: "2026-01-22", value: 6.9, pollster: "Guarumo" },
  { candidate_id: "co-vicky-davila", date: "2026-01-22", value: 4.1, pollster: "Guarumo" },
  { candidate_id: "co-sergio-fajardo", date: "2026-01-22", value: 3.9, pollster: "Guarumo" },
  { candidate_id: "co-claudia-lopez", date: "2026-01-22", value: 2.4, pollster: "Guarumo" },
  { candidate_id: "co-roy-barreras", date: "2026-01-22", value: 1.2, pollster: "Guarumo" },
  { candidate_id: "co-daniel-quintero", date: "2026-01-22", value: 0.8, pollster: "Guarumo" },

  // === CELAG Data — Feb 24, 2026 ===
  { candidate_id: "co-ivan-cepeda", date: "2026-02-24", value: 38.2, pollster: "CELAG" },
  { candidate_id: "co-abelardo-de-la-espriella", date: "2026-02-24", value: 25.2, pollster: "CELAG" },
  { candidate_id: "co-paloma-valencia", date: "2026-02-24", value: 4.6, pollster: "CELAG" },
  { candidate_id: "co-sergio-fajardo", date: "2026-02-24", value: 4.4, pollster: "CELAG" },
  { candidate_id: "co-vicky-davila", date: "2026-02-24", value: 1.5, pollster: "CELAG" },
  { candidate_id: "co-roy-barreras", date: "2026-02-24", value: 1.0, pollster: "CELAG" },
  { candidate_id: "co-claudia-lopez", date: "2026-02-24", value: 0.8, pollster: "CELAG" },
  { candidate_id: "co-daniel-quintero", date: "2026-02-24", value: 0.5, pollster: "CELAG" },

  // === GAD3 — Feb 27, 2026 ===
  { candidate_id: "co-ivan-cepeda", date: "2026-02-27", value: 34.0, pollster: "GAD3" },
  { candidate_id: "co-abelardo-de-la-espriella", date: "2026-02-27", value: 26.0, pollster: "GAD3" },
  { candidate_id: "co-paloma-valencia", date: "2026-02-27", value: 4.0, pollster: "GAD3" },
  { candidate_id: "co-claudia-lopez", date: "2026-02-27", value: 3.0, pollster: "GAD3" },
  { candidate_id: "co-vicky-davila", date: "2026-02-27", value: 2.0, pollster: "GAD3" },
  { candidate_id: "co-sergio-fajardo", date: "2026-02-27", value: 2.0, pollster: "GAD3" },
  { candidate_id: "co-roy-barreras", date: "2026-02-27", value: 1.0, pollster: "GAD3" },
  { candidate_id: "co-daniel-quintero", date: "2026-02-27", value: 0.5, pollster: "GAD3" },
];

const withIds = polls.map((p) => ({
  country_code: "co",
  ...p,
}));

console.log(`Inserting ${withIds.length} poll data points for Colombia...`);

const res = await fetch(`${URL}/rest/v1/poll_data_points`, {
  method: "POST",
  headers: {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal,resolution=ignore-duplicates",
  },
  body: JSON.stringify(withIds),
});

if (!res.ok) {
  const text = await res.text();
  console.error("Error inserting:", res.status, text);
  process.exit(1);
}

console.log(`Successfully inserted ${withIds.length} polls`);
console.log("Pollsters: Guarumo (Jan 22), CELAG (Feb 24), GAD3 (Feb 27)");

// Also update POLLSTER_META to include CELAG and GAD3
console.log("\nNote: Remember to add CELAG and GAD3 to POLLSTER_META in poll-utils.ts");
