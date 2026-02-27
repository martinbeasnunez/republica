/**
 * Recalculate poll stats for all active Colombia candidates
 * using the new weighted recency average.
 */

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function query(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function update(table, id, data) {
  const res = await fetch(`${URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

// Recency weights (Split Ticket model)
function getWeight(daysSince) {
  if (daysSince <= 7) return 0.5;
  if (daysSince <= 14) return 0.3;
  if (daysSince <= 30) return 0.2;
  return 0;
}

const now = new Date();
const candidates = await query("candidates?country_code=eq.co&is_active=eq.true&select=id,short_name");

console.log(`Recalculating ${candidates.length} CO candidates...\n`);

for (const c of candidates) {
  const polls = await query(
    `poll_data_points?candidate_id=eq.${c.id}&order=date.desc&limit=50`
  );

  if (polls.length === 0) {
    console.log(`  ${c.short_name}: no polls, skipping`);
    continue;
  }

  let weightedSum = 0;
  let totalWeight = 0;
  const lastWeek = [];
  const prevWeek = [];

  for (const p of polls) {
    const d = new Date(p.date + "T12:00:00");
    const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    const w = getWeight(days);

    if (w > 0) {
      weightedSum += p.value * w;
      totalWeight += w;
    }

    if (days <= 7) lastWeek.push(p.value);
    else if (days <= 14) prevWeek.push(p.value);
  }

  const poll_average = totalWeight > 0
    ? Math.round((weightedSum / totalWeight) * 100) / 100
    : polls[0].value;

  let poll_trend = "stable";
  if (lastWeek.length > 0 && prevWeek.length > 0) {
    const lwAvg = lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length;
    const pwAvg = prevWeek.reduce((a, b) => a + b, 0) / prevWeek.length;
    if (lwAvg > pwAvg + 0.5) poll_trend = "up";
    else if (lwAvg < pwAvg - 0.5) poll_trend = "down";
  }

  await update("candidates", c.id, { poll_average, poll_trend });

  const pollsters = [...new Set(polls.map(p => p.pollster))];
  console.log(`  ${c.short_name}: ${poll_average}% (${poll_trend}) — ${polls.length} polls from [${pollsters.join(", ")}]`);
}

console.log("\nDone!");
