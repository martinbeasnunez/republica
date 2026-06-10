// =============================================================================
// CONDOR — Pulse Update Cron
// =============================================================================
// Runs every 5 minutes. Snapshots the country state (Registraduría preconteo +
// recent news + last pulse) and asks GPT to write a 50-word factual paragraph
// of *what changed in the last 5 minutes*. Saves to `pulse_updates`.
//
// Idempotent-ish: if the previous pulse was less than 4 minutes ago it skips
// (protects against the Vercel cron firing twice / manual triggers piling up).
// =============================================================================

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || "";

const REGISTRADURIA_BASE = "https://resultados.registraduria.gov.co";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MIN_SECONDS_BETWEEN_PULSES = 4 * 60; // de-dupe window

// ── Types ────────────────────────────────────────────────────────────────────
interface Snapshot {
  // Time the snapshot was taken (UTC ms)
  takenAt: number;
  // Phase label ("pre", "election-day", "post")
  phase: string;
  // Country in country.code terms
  country: CountryCode;
  // Registraduría snapshot (only when country=co + day-of/post)
  preconteo?: {
    percentage: number; // mesas escrutadas
    counted: number;
    total: number;
    leader?: { name: string; percentage: number };
    runnerUp?: { name: string; percentage: number };
  };
  // News in the last ~60 min from DB (scraper)
  recentArticles: Array<{ title: string; source: string; summary?: string }>;
  // Headlines from the broader day (for context if last 20 min is dry)
  dayHeadlines: Array<{ title: string; source: string }>;
  // Recent fact-checks (last 60 min — fact-checks land slower than news)
  recentFactChecks: Array<{ verdict: string; claim: string; source: string }>;
  // LIVE — pulled straight from RSS feeds at request time (minutes-fresh)
  liveRSS: Array<{ title: string; source: string; pubDate: number; description?: string }>;
}

interface Previous {
  id: string;
  generated_at: string;
  summary: string;
  metrics: Record<string, unknown> | null;
}

// ── Phase detection ─────────────────────────────────────────────────────────
// Once the first round has passed, anchor the phase to the runoff date so the
// pulse stream switches to "election-day" cadence on the second-round day.
function detectPhase(country: CountryCode): "pre" | "election-day" | "post" {
  const cfg = COUNTRIES[country];
  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: cfg.timezone });
  let activeDate = cfg.electionDate;
  if (cfg.electionDateSecondRound && todayLocal > cfg.electionDate) {
    activeDate = cfg.electionDateSecondRound;
  }
  if (todayLocal === activeDate) return "election-day";
  if (todayLocal > activeDate) return "post";
  return "pre";
}

// ── Election-window guard ────────────────────────────────────────────────────
// The pulse feed is live election coverage — it only makes sense around the
// jornada. Outside that window every 5-min cron tick still called gpt-4o 24/7,
// burning Fluid CPU (Vercel) + OpenAI $ for a feed nobody is watching. Gate the
// cron to víspera → +2 days post for EITHER round so it self-activates on the
// next election date and goes quiet in between.
const WINDOW_DAYS_BEFORE = 1;
const WINDOW_DAYS_AFTER = 2;

// Whole-day diff (b - a) between two YYYY-MM-DD strings, calendar days.
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ams = Date.UTC(ay, am - 1, ad);
  const bms = Date.UTC(by, bm - 1, bd);
  return Math.round((bms - ams) / 86_400_000);
}

function isWithinElectionWindow(country: CountryCode): boolean {
  const cfg = COUNTRIES[country];
  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: cfg.timezone });
  const dates = [cfg.electionDate, cfg.electionDateSecondRound].filter(Boolean) as string[];
  return dates.some((d) => {
    const diff = dayDiff(d, todayLocal); // >0 after election, <0 before
    return diff >= -WINDOW_DAYS_BEFORE && diff <= WINDOW_DAYS_AFTER;
  });
}

// ── Snapshot builders ───────────────────────────────────────────────────────
async function fetchPreconteo(): Promise<Snapshot["preconteo"]> {
  try {
    const res = await fetch(`${REGISTRADURIA_BASE}/json/ACT/PR/00.json`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const up: any = await res.json();
    const total = Number(String(up?.totales?.act?.metota ?? "0").replace(/[^0-9.-]/g, "")) || 0;
    const counted = Number(String(up?.totales?.act?.mesesc ?? "0").replace(/[^0-9.-]/g, "")) || 0;
    const percentage = Number(String(up?.totales?.act?.pmesesc ?? "0").replace("%", "")) || 0;

    // Flatten candidates from partotabla → sort by votes desc
    const cands: Array<{ name: string; votes: number; percentage: number }> = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of up?.camaras?.[0]?.partotabla ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const c of p?.act?.cantotabla ?? []) {
        const first = String(c?.nomcan ?? "").split(/\s+/)[0] ?? "";
        const lastTokens = String(c?.apecan ?? "").split(/\s+/);
        const particles = new Set(["DE", "DEL", "DELA", "LA", "LAS", "LOS", "VAN", "VON"]);
        let n = 1;
        while (n <= lastTokens.length && particles.has((lastTokens[n - 1] ?? "").toUpperCase())) n++;
        n = Math.min(n, lastTokens.length);
        const surname = lastTokens.slice(0, n).join(" ");
        const display = `${first} ${surname}`.trim();
        const votes = Number(String(c?.vot ?? "0").replace(/[^0-9.-]/g, "")) || 0;
        const pct = Number(String(c?.pvot ?? "0").replace("%", "")) || 0;
        cands.push({ name: display, votes, percentage: pct });
      }
    }
    cands.sort((a, b) => b.votes - a.votes);
    return {
      percentage,
      counted,
      total,
      leader: cands[0] ? { name: cands[0].name, percentage: cands[0].percentage } : undefined,
      runnerUp: cands[1] ? { name: cands[1].name, percentage: cands[1].percentage } : undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * PE conteo — hits our own /api/onpe-results which already auto-detects the
 * runoff subdomain and returns runoff-shape data when ONPE is transmitting.
 * Returns undefined when data is first-round leftover (>2 candidates) so the
 * prompt never invents runoff numbers off old data.
 */
async function fetchOnpeRunoff(origin: string): Promise<Snapshot["preconteo"]> {
  try {
    const res = await fetch(`${origin}/api/onpe-results`, { cache: "no-store" });
    if (!res.ok) return undefined;
    const json = await res.json().catch(() => null);
    if (!json || !Array.isArray(json.candidates)) return undefined;
    // Only treat as runoff data when ≤2 candidates AND isRunoff flag is true.
    if (json.candidates.length > 2 || !json.isRunoff) return undefined;

    const cands: Array<{ name: string; votes: number; percentage: number }> = json.candidates
      .map((c: { name: string; votes: number; percentage: number }) => {
        const parts = String(c.name || "").split(/\s+/);
        const display = parts[0] && parts[parts.length - 1]
          ? `${parts[0]} ${parts[parts.length - 1]}`
          : c.name;
        return { name: display, votes: Number(c.votes) || 0, percentage: Number(c.percentage) || 0 };
      })
      .sort((a: { votes: number }, b: { votes: number }) => b.votes - a.votes);

    const pct = Number(json.progress?.percentage) || 0;
    return {
      percentage: pct,
      counted: Number(json.progress?.counted) || 0,
      total: Number(json.progress?.total) || 0,
      leader: cands[0] ? { name: cands[0].name, percentage: cands[0].percentage } : undefined,
      runnerUp: cands[1] ? { name: cands[1].name, percentage: cands[1].percentage } : undefined,
    };
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRecentArticles(sb: any, country: CountryCode, sinceISO: string) {
  const { data } = await sb
    .from("news_articles")
    .select("title, source, summary")
    .eq("country_code", country)
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false })
    .limit(15);
  return (data ?? []) as Array<{ title: string; source: string; summary?: string }>;
}

/** Noticias más amplias del día (para contexto cuando los últimos 5 min están secos) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTodayHeadlines(sb: any, country: CountryCode) {
  const since = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
  const { data } = await sb
    .from("news_articles")
    .select("title, source")
    .eq("country_code", country)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as Array<{ title: string; source: string }>;
}

/** Live RSS fetch — bypass the DB scraper entirely. We pull straight from
 *  the source so the pulse has minute-fresh material even between scraper runs. */
async function fetchLiveRSS(country: CountryCode): Promise<Array<{ title: string; source: string; pubDate: number; description?: string }>> {
  const UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  const sources = country === "pe"
    ? [
        { name: "El Comercio", url: "https://elcomercio.pe/arcio/rss/" },
        { name: "Gestión", url: "https://gestion.pe/arcio/rss/" },
        { name: "RPP", url: "https://rpp.pe/feed" },
        // Google News aggregates everything — last resort for breaking
        { name: "Google News", url: "https://news.google.com/rss/search?q=balotaje+per%C3%BA+segunda+vuelta+hoy&hl=es&gl=PE&ceid=PE:es" },
      ]
    : [
        { name: "El Tiempo", url: "https://www.eltiempo.com/rss/politica.xml" },
        { name: "Semana", url: "https://www.semana.com/arc/outboundfeeds/rss/category/politica/?outputType=xml" },
        { name: "Infobae", url: "https://www.infobae.com/arc/outboundfeeds/rss/category/colombia/?outputType=xml" },
        { name: "La Silla Vacía", url: "https://www.lasillavacia.com/feed/" },
        // Google News aggregates everything — last resort for breaking
        { name: "Google News", url: "https://news.google.com/rss/search?q=elecciones+colombia+hoy&hl=es&gl=CO&ceid=CO:es" },
      ];

  const fetchOne = async (src: { name: string; url: string }) => {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      const items: Array<{ title: string; source: string; pubDate: number; description?: string }> = [];
      const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/g;
      let m;
      let count = 0;
      while ((m = itemRe.exec(xml)) !== null && count < 25) {
        const block = m[1];
        const t = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/.exec(block);
        const p = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/.exec(block);
        const d = /<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/.exec(block);
        if (!t) continue;
        const title = t[1].replace(/<[^>]+>/g, "").trim();
        const pubDate = p ? new Date(p[1].trim()).getTime() : NaN;
        const description = d
          ? d[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 280)
          : undefined;
        items.push({ title, source: src.name, pubDate, description });
        count++;
      }
      return items;
    } catch {
      return [];
    }
  };

  const all = (await Promise.all(sources.map(fetchOne))).flat();

  // ── Drop boletines automáticos regionales que ahogan la señal ──────────
  // El Comercio publica una entrada por DEPARTAMENTO cada 5 min con la
  // plantilla "Elecciones Perú 2026: Resultados ONPE al X% de la segunda
  // vuelta de [Depto]…". Con 25 departamentos eso son 25 titulares idénticos
  // cada ciclo — el modelo se anclaba ahí y armaba pulsos repitiendo regiones.
  // Filtramos antes de que el modelo los vea, pero solo en PE (esta función
  // se llama con country=pe en su versión peruana).
  const NOISE_PATTERNS_PE: RegExp[] = [
    // El Comercio bulletin per department
    /elecciones\s+per[uú]\s+2026[:\s].*resultados\s+onpe\s+al\s+[\d.,]+%\s+de\s+la\s+segunda\s+vuelta\s+de\s+\w+/i,
    // Variant: "...conteo oficial de votos en vivo" tail
    /resultados\s+onpe\s+al\s+[\d.,]+%.*y\s+conteo\s+oficial\s+de\s+votos\s+en\s+vivo/i,
    // Same shape from any source
    /en\s+\w+,?\s+el\s+conteo\s+oficial\s+de\s+la\s+segunda\s+vuelta\s+alcanza\s+el\s+[\d.,]+%\s+de\s+actas/i,
    // National-level lazy headline: "Resultados ONPE al 95% muestran que la elección sigue ajustada"
    /resultados\s+onpe\s+al\s+[\d.,]+%\s+muestran\s+que\s+la\s+elecci[oó]n\s+(entre\s+\w+\s+\w+\s+y\s+\w+\s+\w+\s+)?sigue\s+(ajustada|re[ñn]ida)/i,
    // Same shape with "indica"
    /resultados\s+onpe\s+al\s+[\d.,]+%\s+(indican|indica)\s+que\s+la\s+(elecci[oó]n|carrera|contienda)\s+(presidencial\s+)?(entre\s+\w+\s+\w+\s+y\s+\w+\s+\w+\s+)?sigue/i,
  ];
  const filtered = all.filter((i) => {
    if (country === "pe") {
      for (const re of NOISE_PATTERNS_PE) {
        if (re.test(i.title)) return false;
      }
    }
    return true;
  });

  // Sort newest first; only items with a parseable date
  return filtered
    .filter((i) => Number.isFinite(i.pubDate))
    .sort((a, b) => b.pubDate - a.pubDate);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRecentFactChecks(sb: any, country: CountryCode, sinceISO: string) {
  const { data } = await sb
    .from("fact_checks")
    .select("verdict, claim, source")
    .eq("country_code", country)
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false })
    .limit(6);
  return (data ?? []) as Array<{ verdict: string; claim: string; source: string }>;
}

// ── Prompt builder ──────────────────────────────────────────────────────────
function buildPrompt(snap: Snapshot, prev: Previous | null, recentPulses: Previous[] = []): string {
  const isPE = snap.country === "pe";
  // Polls open thresholds: CO closes 4 pm Bogotá, PE closes 5 pm Lima
  const localHour = parseInt(
    new Date(snap.takenAt).toLocaleString("en-US", {
      timeZone: isPE ? "America/Lima" : "America/Bogota",
      hour: "numeric",
      hour12: false,
    }),
    10,
  );
  const closeHour = isPE ? 17 : 16;
  const isPollsOpen = snap.phase === "election-day" && localHour < closeHour;

  const lines: string[] = [];

  if (isPE) {
    // ── PE — RUNOFF DAY ROLE & RULES ────────────────────────────────────
    lines.push("Eres CONDOR AI, editor de un live-blog electoral del balotaje presidencial Perú 2026.");
    lines.push("");
    lines.push("═════════════ TU TRABAJO ═════════════");
    lines.push("NO sintetizar una narrativa propia. Tu trabajo es DIGESTAR lo que los medios peruanos están reportando AHORA y ofrecer un pulso de 2 o 3 ÍTEMS ATÓMICOS, cada uno con su fuente. Pensalo como un live-blog tipo El Comercio EN VIVO o La República al minuto — no escribís opinión, no contás una historia, solo decís qué reportó cada medio en los últimos 5–15 min.");
    lines.push("");
    lines.push("═════════════ FORMATO DEL PULSO (OBLIGATORIO) ═════════════");
    lines.push("El campo `summary` debe ser TEXTO PLANO (no markdown, no fences, no JSON anidado). 2 o 3 ítems separados por ` · ` (espacio·espacio). Cada ítem es UNA frase de 12–22 palabras que empieza con el dato concreto y termina con la atribución entre paréntesis al final si NO empezó con el medio.");
    lines.push("");
    lines.push("EJEMPLO BUENO de cómo debe verse el VALOR de `summary` (texto plano, sin comillas externas):");
    lines.push("Con 35.2% de actas, Fujimori se sostiene en 52.8% y Sánchez en 47.2% (ONPE). · Sánchez declara desde Huaral que respetará el resultado (RPP). · Mesa de Comas reabre tras retraso de hora y media por miembro ausente (Gestión).");
    lines.push("");
    lines.push("MAL EJEMPLO (no hagas esto):");
    lines.push("La ONPE ha comenzado a publicar los resultados oficiales del conteo de votos en Iquitos, según Gestión. Keiko Fujimori y Roberto Sánchez compiten en una segunda vuelta presidencial ajustada, mientras el escrutinio avanza y los ciudadanos esperan conocer quién será el próximo presidente.");
    lines.push("Razones por las que es malo: (1) un solo ítem en vez de 2–3, (2) la mitad es relleno ya repetido, (3) ningún número concreto, (4) ningún dato accionable.");
    lines.push("");
    lines.push("═════════════ REGLAS DE ATRIBUCIÓN ═════════════");
    lines.push("- Cada ítem CITA al menos un medio (RPP, Gestión, El Comercio, Infobae Perú, Andina, La República) o autoridad (ONPE, JNE, RENIEC, MOE).");
    lines.push("- Si dos medios reportan lo mismo, elegí UNO — no dupliques.");
    lines.push("- Si NO hay 3 desarrollos distintos en los titulares, hacé un pulso de SOLO 2 ítems. Si solo hay 1 desarrollo nuevo, hacé 1 ítem. NUNCA inventes un ítem para llegar a 3.");
    lines.push("");
    lines.push("═════════════ CANDIDATOS VÁLIDOS ═════════════");
    lines.push("Únicamente Keiko Fujimori (Fuerza Popular) y Roberto Sánchez (Juntos por el Perú). PROHIBIDO mencionar a López Aliaga, Acuña, Forsyth, Urresti, Belmont, Nieto, De Soto, Álvarez, López-Chau y otros eliminados en 1ra vuelta.");
    lines.push("");
    lines.push("═════════════ AUTO-CHECK ESTRICTO ═════════════");
    lines.push("- Cada nombre propio en tu output → debe estar literal en un titular. Si no aparece → BORRÁLO.");
    lines.push("- Cada ciudad/región mencionada → debe estar literal en un titular. Si no → BORRÁLA.");
    lines.push("- Comillas con declaración → debe estar en un titular. Si no → BORRÁLAS.");
    lines.push("- Color inventado ('ambiente de entusiasmo', 'tranquilidad', 'filas desde temprano', 'ciudadanos esperan conocer') → BORRAR.");
    lines.push("");
    lines.push("Si después del check solo te queda 1 dato verificable, hacé 1 ítem. SI NO HAY NADA VERIFICABLE FRESCO, devolvé esto exacto: \"Sin novedades verificables en los últimos minutos. Próxima actualización en 5 min.\"");
    lines.push("");
    lines.push("DATOS DEL DÍA E QUE SÍ PODÉS USAR sin titular (son públicos):");
    lines.push("- ~25,3 millones de electores habilitados");
    lines.push("- Mesas abren a las 8:00 a.m., cierran a las 5:00 p.m. (hora Lima)");
    lines.push("- Conteo oficial de ONPE arranca al cierre — primeros boletines entre 5:30 y 6 p.m.");
    lines.push("- 25 departamentos + Lima + Callao + voto en el exterior en consulados peruanos");
    lines.push("- Voto obligatorio entre 18 y 70 años. Multa para quien no vota.");
    lines.push("- JNE administra justicia electoral, ONPE organiza, RENIEC gestiona padrón.");
    lines.push("- Dina Boluarte es PRESIDENTA SALIENTE, no candidata. Pedro Castillo está preso. Si los titulares los reportan, contar — si no, no inventes.");
    lines.push("- Antauro Humala respaldó públicamente a Roberto Sánchez en campaña.");
    lines.push("");
    lines.push("Si después del auto-check quedaste sin material → escribí un pulso CORTO de 1–2 frases con SÓLO datos del día. Eso es honesto y permitido.");
    lines.push("");
  } else {
    // ── CO — FIRST ROUND ROLE & RULES (original) ────────────────────────
    lines.push("Eres CONDOR AI, periodista colombiano de live-blog electoral en la primera vuelta presidencial.");
    lines.push("");
    lines.push("═════════════ REGLA #1 (más importante que todas) ═════════════");
    lines.push("CADA AFIRMACIÓN QUE ESCRIBAS DEBE PODER SEÑALARSE A UN TITULAR DE LA LISTA QUE TE PASO O A UN DATO PÚBLICO CONFIRMADO. Si no podés señalar de dónde sale, NO LO ESCRIBAS. Mejor un pulso corto y verdadero que uno largo e inventado.");
    lines.push("");
    lines.push("AUTO-CHECK ANTES DE ESCRIBIR (cada item te bota si fallás):");
    lines.push("- ¿Mencionás un nombre propio (Cepeda, López, Cabal, De la Espriella, Petro, etc.)? → ese nombre TIENE QUE estar literal en al menos un titular. Si no aparece → BORRAR.");
    lines.push("- ¿Decís que una persona específica votó / está votando / declaró? → tiene que decirlo un titular. Si no → BORRAR.");
    lines.push("- ¿Mencionás ciudad o región específica como lugar de votación? → tiene que decirlo un titular. Si no → BORRAR.");
    lines.push("- ¿Comillas con declaración? → tiene que estar en un titular. Si no → BORRAR.");
    lines.push("- ¿'MOE informa', 'autoridades reportan', 'fuentes señalan'? → tiene que ser de un titular. Si no → BORRAR.");
    lines.push("- ¿'ambiente de entusiasmo', 'filas desde temprano', 'gran afluencia', 'tranquilidad', 'tensa calma'? → COLOR INVENTADO. BORRAR.");
    lines.push("");
    lines.push("Si después del check te quedaste sin nombres propios ni lugares específicos, eso ES NORMAL y BUENO. Hacé un pulso de 1–2 frases con datos públicos (mesas, electores, cédula digital, hora de cierre, voto en exterior). Eso es honesto. NO RELLENES.");
    lines.push("");
    lines.push("FOCO DEL DÍA E:");
    lines.push("Hoy lo único que importa es LA JORNADA. NO análisis de 'quién va ganando', NO encuestas, NO proyecciones. Solo lo que está pasando hoy según los medios.");
    lines.push("");
    lines.push("DATOS DÍA E QUE SÍ PODÉS USAR sin titular (son públicos):");
    lines.push("- ~41,4 millones de electores habilitados");
    lines.push("- 122.020 mesas de votación");
    lines.push("- 13 candidatos a la presidencia (Iván Cepeda, Claudia López, Raúl Botero, Abelardo De la Espriella, Óscar Lizcano, Miguel Uribe Londoño, Sondra Macollins, Roy Barreras, Carlos Caicedo, Gustavo Matamoros, Paloma Valencia, Sergio Fajardo, Luis Murillo)");
    lines.push("- 33 departamentos + voto en el exterior en ~70 países");
    lines.push("- Mesas abren 8 a.m., cierran 4 p.m. (hora Bogotá)");
    lines.push("- Preconteo arranca al cierre");
    lines.push("- Cédula digital permite votar usando celular compatible");
    lines.push("- Gustavo Petro es PRESIDENTE SALIENTE, no candidato. Vota como cualquier ciudadano si los titulares lo reportan.");
    lines.push("");
    lines.push("Si después del auto-check quedaste sin material → escribí un pulso CORTO de 1–2 frases con SÓLO datos del día. Eso es honesto y permitido.");
    lines.push("");
  }

  // ── STYLE ────────────────────────────────────────────────────────────────
  if (isPE) {
    lines.push("REGLAS DE ESTILO:");
    lines.push("1. FORMATO digest: 2 o 3 ítems separados por ` · ` (espacio·espacio). Cada ítem cita un medio o autoridad. Total 50–80 palabras.");
    lines.push("2. NO empieces con la hora ni 'la ONPE ha comenzado a publicar' ni 'el escrutinio avanza' ni 'los ciudadanos esperan conocer'. Empezá por el DATO concreto.");
    lines.push("3. NO escribas 'hora Lima' ni 'hora peruana'. Si decís una hora basta así: 'a las 5:00 p.m.'");
    lines.push("4. 'Lima' es ciudad, NO país. Cuando hablés del país decí 'Perú'.");
    lines.push("5. Tono live-blog peruano: presente, periodístico, factual, breve. NO sintetices una narrativa épica — solo digestá lo que reportaron los medios en los últimos minutos.");
    lines.push("6. PROHIBIDO ABSOLUTO mencionar '0% de actas escrutadas' o '0% de votos' antes de las 5 p.m.");
    lines.push("7. PROHIBIDO frases vacías: 'la jornada avanza con normalidad', 'sin contratiempos', 'sin incidentes', 'sin novedades', 'la votación se desarrolla', 'ejerzan su derecho al voto', 'continúan abiertas hasta las 5 p.m.', 'mientras el escrutinio avanza', 'los ciudadanos esperan conocer', 'una segunda vuelta ajustada/reñida', 'compiten en una contienda'. Son MULETILLAS — borrá.");
    lines.push("8. PROHIBIDO predicciones, probabilidades, escenarios futuros, opinión sobre quién gana.");
    lines.push("9. NO repitas los mismos números/contexto en cada pulso. Si pulsos anteriores ya dijeron '~25,3M electores', no lo vuelvas a decir.");
    lines.push("10. CADA ítem nuevo debe ser un DESARROLLO DISTINTO. No 3 versiones de la misma noticia con cambios cosméticos. Si solo hay 1 desarrollo, hacé 1 ítem.");
    lines.push("11. NÚMEROS Y EVENTOS CON CONTEXTO: cada cifra/evento explicado en la misma frase. NUNCA dejes un número al aire.");
    lines.push("");
  } else {
    lines.push("REGLAS DE ESTILO:");
    lines.push("1. NO empieces con la hora ni con '11:00 a.m.' — la hora ya aparece como metadato. Empezá por el HECHO.");
    lines.push("2. NO escribas 'hora Bogotá' ni 'hora colombiana'. Si decís una hora basta así: 'a las 4:00 p.m.'");
    lines.push("3. 'Bogotá' es ciudad, NO país. Cuando hablés del país decí 'Colombia' o 'el país'.");
    lines.push("4. Tono live-blog colombiano: presente continuo, periodístico, breve, factual. Como Semana en vivo o La Silla Vacía minuto a minuto.");
    lines.push("5. Máximo 55 palabras, un solo párrafo, sin saludo, sin firma, sin signos de exclamación.");
    lines.push("6. PROHIBIDO ABSOLUTO mencionar '0% de mesas escrutadas' o '0% de votos' antes de las 4 p.m.");
    lines.push("7. PROHIBIDO frases vacías: 'la jornada avanza con normalidad', 'sin contratiempos', 'sin incidentes', 'sin novedades', 'la votación se desarrolla', 'ejerzan su derecho al voto', 'permitiendo que los electores voten', 'continúan abiertas hasta las 4 p.m.'. Esas son muletillas — el lector ya sabe.");
    lines.push("8. PROHIBIDO predicciones, probabilidades, escenarios futuros, opinión.");
    lines.push("9. NO repitas los mismos números en cada pulso. Si los pulsos anteriores ya dijeron '122.020 mesas' o '~41,4M electores', NO los vuelvas a decir. Asumí que el lector ya los tiene de contexto.");
    lines.push("10. Variá el ángulo respecto a los pulsos anteriores. Si el anterior habló de A, el tuyo NO puede empezar por A.");
    lines.push("11. NÚMEROS Y EVENTOS CON CONTEXTO: si mencionás una cifra (pesos, mesas, personas, kilos, etc.) o un evento (incautación, alerta, alerta, retraso, denuncia) tenés que explicar EN LA MISMA FRASE para qué/por qué. NUNCA dejes un número o un evento al aire que obligue al lector a pensar 'a qué se refiere'. Ejemplo: ❌ 'mil millones de pesos incautados' / ✅ 'mil millones de pesos incautados en operativos contra compra de votos'.");
    lines.push("");
    lines.push("EJEMPLO DE PULSO IDEAL (estructura, no contenido):");
    lines.push("  ❌ MAL: '11:00 a.m. Las 122.020 mesas están abiertas. ~41,4 millones de electores pueden votar hasta las 4 p.m. hora Bogotá.'");
    lines.push("  ✅ BIEN: 'El procurador Gregorio Eljach pide neutralidad a los funcionarios. La Registraduría reporta votación en exterior con filas en Madrid y Miami desde antes del mediodía.'");
    lines.push("  ✅ BIEN: 'Caracol Radio reporta que un puesto de votación en Cauca operó con dos horas de retraso por logística. La Defensoría ya envió equipo.'");
    lines.push("");
  }

  // ── ÁNGULOS DISPONIBLES (rotar) ─────────────────────────────────────────
  if (isPE) {
    lines.push("ÁNGULOS POSIBLES (elegí uno distinto al pulso anterior):");
    lines.push("- Los dos finalistas sufragando (dónde votan Fujimori o Sánchez, a qué hora, qué declaran)");
    lines.push("- Jornada en una región específica (Lima, Arequipa, Cusco, Trujillo, Piura, Iquitos, Puno)");
    lines.push("- Voto en el exterior — peruanos en Madrid, Miami, Buenos Aires, Santiago, Roma, etc.");
    lines.push("- Incidentes / irregularidades / quejas reportadas (si las hay)");
    lines.push("- Observación electoral, ONPE, JNE, Defensoría del Pueblo, Fiscalía");
    lines.push("- Operativo de las Fuerzas Armadas y PNP — seguridad en mesas");
    lines.push("- Conversación en redes / tendencias / hashtags");
    lines.push("- Recordatorios prácticos a votantes (multa por no votar, miembro de mesa, hora cierre)");
    lines.push("- Declaraciones de ONPE, JNE, gobierno de Boluarte");
    lines.push("- Fact-checks recientes desmintiendo bulos del balotaje");
    lines.push("- Endorsements relevantes (Antauro Humala a Sánchez, etc.) — solo si están en titulares");
    lines.push("");
    lines.push("=== Contexto del momento ===");
    lines.push(`Hora local Perú: ${new Date(snap.takenAt).toLocaleString("es-PE", { timeZone: "America/Lima" })}`);
    lines.push(`Fase: ${snap.phase} (segunda vuelta presidencial)`);
    lines.push(`Estado de mesas: ${isPollsOpen ? "ABIERTAS — peruanos votando en este momento. El conteo de ONPE arranca a las 5:00 p.m." : snap.phase === "election-day" ? "CERRADAS — escrutinio del balotaje en marcha" : "post-elección"}`);
    lines.push("Datos del día: ~25,3 millones de electores habilitados · 25 departamentos + Lima + Callao + voto en el exterior · Balotaje del 7 de junio 2026");
    lines.push("Finalistas: Keiko Fujimori (Fuerza Popular) vs Roberto Sánchez (Juntos por el Perú)");
  } else {
    lines.push("ÁNGULOS POSIBLES (elegí uno distinto al pulso anterior):");
    lines.push("- Candidatos sufragando (dónde, a qué hora, qué declaran)");
    lines.push("- Jornada en una región específica (Antioquia, Valle, Bogotá, Caribe, exteriores)");
    lines.push("- Voto en el exterior — colombianos en Madrid, Miami, Buenos Aires, etc.");
    lines.push("- Incidentes / irregularidades / quejas reportadas (si las hay)");
    lines.push("- Observación electoral (MOE), Procuraduría, defensoría");
    lines.push("- Operativo de la Fuerza Pública / seguridad");
    lines.push("- Conversación en redes / tendencias / hashtags");
    lines.push("- Datos del día: cuántos sufragantes habilitados (~41 millones), 13 candidatos, 33 departamentos");
    lines.push("- Recordatorios prácticos a votantes (cédula digital, lista celulares, hora cierre)");
    lines.push("- Contexto histórico (primera presidencial post-gobierno Petro, etc.)");
    lines.push("- Declaraciones de Registraduría, CNE, gobierno");
    lines.push("- Fact-checks recientes (si los hay) — desmintiendo bulos");
    lines.push("");
    lines.push("=== Contexto del momento ===");
    lines.push(`Hora local Colombia: ${new Date(snap.takenAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}`);
    lines.push(`Fase: ${snap.phase}`);
    lines.push(`Estado de mesas: ${isPollsOpen ? "ABIERTAS — colombianos votando en este momento. El conteo arranca a las 4:00 p.m." : snap.phase === "election-day" ? "CERRADAS — escrutinio en marcha" : "post-elección"}`);
    lines.push("Datos del día: ~41,4 millones de electores habilitados · 122.020 mesas de votación instaladas · 13 candidatos inscritos · 33 departamentos + voto en el exterior");
  }

  // ── NOTICIAS (PROTAGONISTA) ─────────────────────────────────────────────
  // Priorizamos liveRSS (minute-fresh, directo de la fuente) > recentArticles (DB) > dayHeadlines
  const cutoff15min = snap.takenAt - 15 * 60 * 1000;
  const cutoff60min = snap.takenAt - 60 * 60 * 1000;
  const liveFresh = snap.liveRSS.filter((i) => i.pubDate >= cutoff15min);
  const liveLastHour = snap.liveRSS.filter((i) => i.pubDate >= cutoff60min && i.pubDate < cutoff15min);

  lines.push("");
  if (liveFresh.length > 0) {
    lines.push(`=== TITULARES EN VIVO últimos 15 min (${liveFresh.length}, recién publicados) — USÁ ESTOS PRIMERO ===`);
    liveFresh.slice(0, 12).forEach((a) => {
      const ago = Math.round((snap.takenAt - a.pubDate) / 60000);
      lines.push(`• [hace ${ago} min · ${a.source}] ${a.title}${a.description ? `\n    ↳ ${a.description}` : ""}`);
    });
  }
  if (liveLastHour.length > 0) {
    lines.push("");
    lines.push(`=== Titulares de la última hora (${liveLastHour.length}) ===`);
    liveLastHour.slice(0, 12).forEach((a) => {
      const ago = Math.round((snap.takenAt - a.pubDate) / 60000);
      lines.push(`- [hace ${ago} min · ${a.source}] ${a.title}${a.description ? `\n    ↳ ${a.description}` : ""}`);
    });
  }
  if (snap.recentArticles.length > 0) {
    lines.push("");
    lines.push(`=== Noticias ya procesadas por CONDOR (DB, contexto adicional, ${snap.recentArticles.length}) ===`);
    snap.recentArticles.slice(0, 8).forEach((a) => {
      const s = (a.summary ?? "").slice(0, 160);
      lines.push(`- ${a.title}${s ? ` — ${s}` : ""} (${a.source})`);
    });
  }
  if (snap.dayHeadlines.length > 0 && liveFresh.length === 0 && liveLastHour.length === 0) {
    lines.push("");
    lines.push(`=== Titulares del día (últimas 8h, ${snap.dayHeadlines.length}) — usá si no hay nada más fresco ===`);
    snap.dayHeadlines.slice(0, 12).forEach((a) => lines.push(`- ${a.title} (${a.source})`));
  }

  // ── FACT CHECKS ──────────────────────────────────────────────────────────
  if (snap.recentFactChecks.length > 0) {
    lines.push("");
    lines.push("=== Verificaciones recientes (úsalas si encajan en el ángulo) ===");
    snap.recentFactChecks.forEach((f) => lines.push(`- ${f.verdict}: ${f.claim.slice(0, 140)} (${f.source})`));
  }

  // ── CONTEXTO CONTEO OFICIAL (después de cierre de mesas) ────────────────
  // For PE this is ONPE (runoff Fujimori vs Sánchez). For CO this is the
  // Registraduría preconteo. We compute deltas vs the previous pulse so the
  // model can lead with movement instead of repeating "ONPE empezó a contar".
  if (snap.preconteo && !isPollsOpen) {
    const p = snap.preconteo;
    const sourceLabel = isPE ? "ONPE (conteo oficial balotaje)" : "Preconteo Registraduría";
    lines.push("");
    lines.push(`=== ${sourceLabel} — DATOS NUMÉRICOS DEL MOMENTO ===`);
    lines.push(`Actas escrutadas: ${p.percentage}% (${p.counted} de ${p.total} mesas)`);
    if (p.leader) lines.push(`Lidera ${p.leader.name} con ${p.leader.percentage}%`);
    if (p.runnerUp) lines.push(`Segundo ${p.runnerUp.name} con ${p.runnerUp.percentage}%`);
    if (p.leader && p.runnerUp) {
      const delta = (p.leader.percentage - p.runnerUp.percentage);
      lines.push(`Diferencia actual entre los dos: ${delta.toFixed(1)} pp`);
    }
    if (prev?.metrics) {
      const m = prev.metrics as Record<string, number | string | undefined>;
      const prevPct = typeof m.percentage === "number" ? m.percentage : null;
      const prevLeaderPct = typeof m.leaderPercentage === "number" ? m.leaderPercentage : null;
      const prevRunnerPct = typeof m.runnerUpPercentage === "number" ? m.runnerUpPercentage : null;
      if (prevPct != null) {
        lines.push(`Hace ~5 min iba ${prevPct}% de actas${m.leaderName ? ` con ${m.leaderName} en ${prevLeaderPct}%` : ""}.`);
      }
      // Pre-compute the deltas the model is most likely to need so it doesn't
      // have to do mental math.
      if (p.leader && prevLeaderPct != null) {
        const d = p.leader.percentage - prevLeaderPct;
        if (Math.abs(d) >= 0.1) {
          lines.push(`Δ líder en últimos 5 min: ${d > 0 ? "+" : ""}${d.toFixed(2)} pp.`);
        }
      }
      if (p.runnerUp && prevRunnerPct != null) {
        const d = p.runnerUp.percentage - prevRunnerPct;
        if (Math.abs(d) >= 0.1) {
          lines.push(`Δ segundo en últimos 5 min: ${d > 0 ? "+" : ""}${d.toFixed(2)} pp.`);
        }
      }
    }
    if (isPE) {
      lines.push("");
      lines.push("⚡ CÓMO USAR ESTOS NÚMEROS EN EL PULSO:");
      lines.push("- Estos números YA APARECEN como bloque visual arriba en la home (el lector los ve constantemente). NO los repitas como ítem por sí solos.");
      lines.push("- Sí podés referenciarlos como CONTEXTO de otro hecho: 'Con 95% de actas y diferencia <0.3 pp, los bonos peruanos retroceden...' o 'A 30 mil votos de diferencia, Fujimori anuncia que esperará el escrutinio del JEE...'");
      lines.push("- Si el cambio vs hace 5 min es ≥0.3pp O hubo flip de líder O cerró 100% un departamento clave, ESO sí amerita un ítem propio. De lo contrario, prioriza otra noticia.");
    }
  }

  // ── PULSES YA PUBLICADOS (anti-repetición) ──────────────────────────────
  // Mostramos los últimos 5 para que el modelo vea exactamente qué temas,
  // nombres y titulares ya cubrió. Su trabajo es encontrar un ángulo DISTINTO.
  if (recentPulses.length > 0) {
    lines.push("");
    lines.push("=== PULSOS YA PUBLICADOS (no repetir ningún ángulo de aquí) ===");
    recentPulses.forEach((p, i) => {
      const ago = Math.round((snap.takenAt - new Date(p.generated_at).getTime()) / 60000);
      lines.push(`[hace ${ago} min] "${p.summary}"`);
      void i;
    });
    lines.push("");
    lines.push("REGLA EXTRA: NO mencionés a las mismas personas, lugares o hechos que ya cubriste en los pulsos anteriores. Si los titulares más frescos son sobre lo mismo, buscá otro ángulo: otra región, otra autoridad, otra cifra del día, otro candidato del listado, otro tema. Variá.");
    lines.push("");
    lines.push("ANTI-BOILERPLATE: no termines cada pulso con la misma muletilla. Si los pulsos anteriores ya dijeron '~41,4 millones de electores' o 'las 122.020 mesas hasta las 4 p.m.' o 'colombianos ejerzan su derecho al voto', NO LO REPITAS. Esa cifra es contexto que el lector ya tiene. Enfocate sólo en el ángulo nuevo de este pulso, sin cierre genérico. Mejor terminar abrupto y específico que con frase de relleno.");
    lines.push("");
    lines.push("🚫 PLANTILLAS PROHIBIDAS (si tu primer borrador empieza así, BORRALO y empezá de nuevo):");
    lines.push('- "La ONPE ha comenzado a publicar..." / "Empezó el conteo en X..."');
    lines.push('- "Resultados ONPE al X% de la segunda vuelta en [departamento] muestran casi el cierre total..."');
    lines.push('- "En [departamento], el conteo oficial de la segunda vuelta alcanza el X% de actas procesadas..."');
    lines.push('- Cualquier variante de "ONPE al X% en [departamento]" — el conteo regional sale auto-publicado en El Comercio cada 5 min, son boletines de máquina, NO son tu pulso.');
    lines.push('- "Keiko Fujimori y Roberto Sánchez compiten en una ajustada/reñida segunda vuelta..."');
    lines.push('- "Mientras el escrutinio avanza, los ciudadanos esperan conocer quién será..."');
    lines.push('- "Los peruanos / colombianos esperan el desenlace..."');
    lines.push('- "La contienda electoral se intensifica..."');
    lines.push("Esas son MULETILLAS de live-blog perezoso. El lector YA TIENE arriba el contador oficial. Tu pulso debe ser lo que el contador NO muestra: declaraciones, mercados, OEA, incidentes, reacciones, fact-checks, hitos del JNE/ONPE.");
  }

  // ── DIRECTIVA FINAL ──────────────────────────────────────────────────────
  lines.push("");
  if (snap.phase === "pre") {
    lines.push("ESCRIBE el pulso AHORA (≤ 55 palabras, un párrafo): cierre de campaña, expectativa, fact-check, declaración. Sin frases vacías.");
  } else if (isPollsOpen) {
    lines.push("ESCRIBE el pulso AHORA (≤ 55 palabras, un párrafo). Es DÍA E con mesas ABIERTAS. Elegí UN ángulo concreto y específico — alguien, en algún lugar, hizo algo. Nada de '0% escrutado'. Nada de 'sin novedades'. Si no hay incidentes, hablá de quién votó, dónde, qué dijo, o de un dato del día.");
  } else if (snap.phase === "election-day") {
    if (snap.preconteo && isPE) {
      lines.push(
        "ESCRIBE el pulso AHORA. POST-CIERRE EN BALOTAJE PE. FORMATO: 2 o 3 ítems separados por ` · ` (50–80 palabras total).",
      );
      lines.push("");
      lines.push("REGLA CRÍTICA SOBRE EL CONTEO ONPE:");
      lines.push("- El total nacional ya aparece en el bloque 'Conteo Oficial' de la home. NO lo repitas como ítem.");
      lines.push("- Los porcentajes por departamento (Arequipa 99%, Moquegua 99%, Tacna 98%, etc.) son RUIDO — son boletines automáticos de El Comercio. NO los conviertas en ítems del pulso. NO digas 'ONPE al X% en [departamento]'.");
      lines.push("- SÍ es ítem válido del conteo solo si: (a) hubo cambio de líder, (b) cerró al 100% un departamento clave (Lima, Arequipa, La Libertad), (c) movimiento >0.3pp en el total nacional en los últimos 10 min vs hace 5 min. Si no se cumple ninguna, NO menciones %.");
      lines.push("");
      lines.push("¿QUÉ DEBERÍA SER CADA ÍTEM ENTONCES? Lo que el lector NO ve en el contador:");
      lines.push("- Declaraciones de Fujimori, Sánchez, sus equipos, Boluarte, voceros de partido (con cita o paráfrasis del titular)");
      lines.push("- Reacciones internacionales: OEA, observadores, embajadas");
      lines.push("- Mercado: BVL, sol, bonos peruanos");
      lines.push("- Incidentes: irregularidades en mesas, denuncias, tachas");
      lines.push("- Movimientos: marchas, concentraciones, vigilias afuera de los locales");
      lines.push("- Personajes: Castillo, Humala, líderes religiosos, gremios opinando");
      lines.push("- Fact-checks: bulos circulando en redes y su verdict");
      lines.push("- Hitos del JNE/ONPE: cómputo distrital terminado, transmisión a JEE, primera proclama");
      lines.push("");
      lines.push("Cada ítem cita su medio entre paréntesis al final. NO uses el mismo medio 2 veces en el mismo pulso si tenés alternativa.");
      lines.push("");
      lines.push("Si después de filtrar el ruido SOLO tenés titulares de % regionales del conteo, hacé UN solo ítem con la diferencia nacional actual en votos absolutos + delta vs hace 5 min y cerrá ahí. NO inflés con regional fluff.");
    } else {
      lines.push("ESCRIBE el pulso AHORA (≤ 55 palabras): cambios en el preconteo + declaraciones, en un párrafo, sin signos de exclamación.");
    }
  } else {
    lines.push("ESCRIBE el pulso AHORA (≤ 55 palabras): resultados, reacciones, próximos pasos.");
  }

  return lines.join("\n");
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  // Auth — Vercel cron sends Authorization: Bearer ${CRON_SECRET}
  const authHeader = request.headers.get("authorization") || "";
  const expected = `Bearer ${CRON_SECRET}`;
  if (CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ?country=co — required (default to co for the launch day)
  const { searchParams } = new URL(request.url);
  const countryParam = (searchParams.get("country") ?? "co") as CountryCode;
  if (!(countryParam in COUNTRIES)) {
    return NextResponse.json({ error: "invalid country" }, { status: 400 });
  }
  const country = countryParam;
  const isPE = country === "pe";
  const phase = detectPhase(country);

  // Out of the election window? Skip before touching Supabase/OpenAI so the
  // 5-min cron costs ~nothing between rounds. Pass ?force=1 to override.
  const force = searchParams.get("force") === "1";
  if (!force && !isWithinElectionWindow(country)) {
    return NextResponse.json({ skipped: "out-of-window", country, phase });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_KEY) {
    return NextResponse.json({ error: "missing env vars" }, { status: 500 });
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

  // Pull last 5 pulses — newest first. We use [0] for dedupe and for "previous"
  // metric deltas, and the whole list as the "ya cubrí esto" context.
  const { data: lastRows } = await sb
    .from("pulse_updates")
    .select("id, generated_at, summary, metrics")
    .eq("country_code", country)
    .order("generated_at", { ascending: false })
    .limit(5);
  const recentPulses: Previous[] = (lastRows ?? []) as Previous[];
  const prev: Previous | null = recentPulses[0] ?? null;
  if (prev) {
    const ageSec = (Date.now() - new Date(prev.generated_at).getTime()) / 1000;
    if (ageSec < MIN_SECONDS_BETWEEN_PULSES) {
      return NextResponse.json({ skipped: "too-soon", lastAgeSec: Math.round(ageSec) });
    }
  }

  // ── Build snapshot ────────────────────────────────────────────────────────
  // 60-min window for "recent" — the news scrapers don't run instantly and we
  // want enough surface area for the model to pick a fresh angle. dayHeadlines
  // (8h) is always included as broader context.
  const sinceISO = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const factCheckSinceISO = new Date(Date.now() - 90 * 60 * 1000).toISOString();
  // Pull live conteo data per country. For CO that's Registraduría preconteo;
  // for PE we hit our own /api/onpe-results (which auto-detects the runoff
  // subdomain). Skip during "pre" since polls aren't open yet.
  const origin = new URL(request.url).origin;
  const conteoFetcher: Promise<Snapshot["preconteo"]> =
    phase === "election-day" || phase === "post"
      ? country === "co"
        ? fetchPreconteo()
        : country === "pe"
          ? fetchOnpeRunoff(origin)
          : Promise.resolve(undefined)
      : Promise.resolve(undefined);
  const [preconteo, recentArticles, dayHeadlines, recentFactChecks, liveRSS] = await Promise.all([
    conteoFetcher,
    fetchRecentArticles(sb, country, sinceISO),
    fetchTodayHeadlines(sb, country),
    fetchRecentFactChecks(sb, country, factCheckSinceISO),
    fetchLiveRSS(country),
  ]);

  const snap: Snapshot = {
    takenAt: Date.now(),
    phase,
    country,
    preconteo,
    recentArticles,
    dayHeadlines,
    recentFactChecks,
    liveRSS,
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const openai = new OpenAI({ apiKey: OPENAI_KEY });
  const prompt = buildPrompt(snap, prev, recentPulses);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 220,
  });

  let summary = completion.choices[0]?.message?.content?.trim() || "";
  if (!summary) {
    return NextResponse.json({ error: "empty completion" }, { status: 500 });
  }

  /**
   * Defensive unwrap. The completion is requested with
   * response_format: json_object so the API returns `{ "summary": "..." }`.
   * Sometimes the model also wraps the summary VALUE in markdown fences /
   * a nested JSON literal because the prompt mentions JSON. We strip those
   * shells so the stored summary is always plain text.
   *
   * Patterns we've seen:
   *   "```json { \"summary\": \"text\" } ```"
   *   "{ \"summary\": \"text\" }"
   *   "```\n{ ... }\n```"
   */
  function unwrapNoise(s: string): string {
    let out = s.trim();
    // Strip ```json … ``` or ``` … ``` fences (possibly outside the JSON object)
    out = out.replace(/^```(?:json|JSON)?\s*/, "").replace(/```\s*$/, "").trim();
    // If the whole thing is a JSON object with a `summary` field, pluck it.
    if (out.startsWith("{") && out.endsWith("}")) {
      try {
        const parsed = JSON.parse(out) as { summary?: unknown };
        if (typeof parsed.summary === "string") out = parsed.summary;
      } catch {
        /* not parseable — leave as-is */
      }
    }
    // Strip leading "summary:" if the model just dumped the key
    out = out.replace(/^\s*summary\s*[:=]\s*/i, "").trim();
    // Strip surrounding quotes
    if ((out.startsWith('"') && out.endsWith('"')) || (out.startsWith("'") && out.endsWith("'"))) {
      out = out.slice(1, -1).trim();
    }
    return out;
  }

  // First unwrap pass — the outer envelope is JSON because of response_format
  try {
    const outer = JSON.parse(summary) as { summary?: unknown };
    if (typeof outer.summary === "string") summary = outer.summary.trim();
  } catch {
    /* fall through */
  }
  // Second pass — clean any leftover fences / nested JSON in the value
  summary = unwrapNoise(summary);

  // ── Validación post-generación contra alucinaciones ─────────────────────
  // El modelo, aún con prompt durísimo, sigue inventando. Validamos que cada
  // nombre propio mencionado esté literal en algún titular reciente. Si no,
  // sustituimos por un pulso fallback factual con solo datos públicos.
  const headlinesText = [
    ...snap.liveRSS.map((a) => a.title),
    ...snap.recentArticles.map((a) => a.title),
    ...snap.dayHeadlines.map((a) => a.title),
  ].join(" ").toLowerCase();

  // Nombres propios de candidatos + presidente saliente
  const protectedNames = [
    "cepeda", "claudia lópez", "lópez", "botero", "espriella", "lizcano",
    "uribe", "macollins", "barreras", "caicedo", "matamoros", "valencia",
    "fajardo", "murillo", "petro",
  ];
  const mentionedNames = protectedNames.filter((n) =>
    new RegExp(`\\b${n.replace(/\s+/g, "\\s+")}\\b`, "i").test(summary),
  );
  const ungroundedNames = mentionedNames.filter((n) => !headlinesText.includes(n));

  // Otras señales de fabricación: comillas con declaraciones, frases de color literario
  const hasInventedQuote = /"[^"]{15,}"|"[^"]{15,}"/.test(summary);
  const hasLiteraryColor = /(ambiente de entusiasmo|filas desde temprano|gran afluencia|tensa calma|tranquilidad reinante|con entusiasmo|cl[ií]ma de fiesta|sin contratiempos|sin incidentes|sin novedades|jornada avanza con normalidad|ejerzan su derecho al voto|permitiendo que los electores)/i.test(summary);
  // Boilerplate prohibido: hora al inicio, "hora Bogotá", muletillas que vacían el pulso
  const startsWithTime = /^\s*\d{1,2}[:.]?\d{0,2}\s*(a\.?\s?m\.?|p\.?\s?m\.?)?\b/i.test(summary);
  const hasHoraBogota = /hora\s+bogot[áa]|hora\s+colombiana/i.test(summary);

  // PE-only: el "Resultados ONPE al X%…" template como apertura. Esos boletines
  // automáticos los filtramos del RSS pero el modelo a veces los re-inventa por
  // su cuenta. Si el ítem ABRE así (con o sin "muestran que… sigue ajustada"),
  // o si TODOS los ítems del pulso son de esa forma, lo botamos.
  const startsWithOnpePercent = isPE && /^\s*(elecciones\s+per[uú]\s+2026[:\s]+)?resultados\s+onpe\s+al\s+[\d.,]+%/i.test(summary);
  // El template "muestran que la elección … sigue ajustada/reñida" en cualquier parte
  const hasOnpeAjustadaTemplate = isPE && /resultados\s+onpe\s+al\s+[\d.,]+%\s+(muestran|indican?)\s+que\s+la\s+(elecci[oó]n|carrera|contienda)/i.test(summary);
  // Pulso entero hecho de "ONPE al X% en [depto]" / "En [depto], conteo alcanza X%"
  const items = summary.split(/\s+·\s+/).map((s) => s.trim()).filter(Boolean);
  const allItemsRegional = isPE && items.length >= 1 && items.every((it) =>
    /resultados\s+onpe\s+al\s+[\d.,]+%/i.test(it) ||
    /en\s+\w+,?\s+el\s+conteo\s+oficial.*alcanza\s+el\s+[\d.,]+%/i.test(it),
  );

  const failedValidation = ungroundedNames.length > 0 || hasInventedQuote || hasLiteraryColor || startsWithTime || hasHoraBogota || startsWithOnpePercent || hasOnpeAjustadaTemplate || allItemsRegional;

  let fallbackUsed = false;
  if (failedValidation) {
    // En vez de un fallback preescrito (genérico y aburrido), pedimos al modelo
    // que vuelva a intentar — esta vez con un prompt mucho más restrictivo que
    // lo OBLIGA a basarse en un titular concreto y agarrar un ángulo nuevo.
    fallbackUsed = true;
    const retryLines: string[] = [];
    retryLines.push("Tu pulso anterior fue rechazado por el validador. Razones:");
    if (ungroundedNames.length) retryLines.push(`- Mencionaste nombres que no están en los titulares: ${ungroundedNames.join(", ")}`);
    if (hasInventedQuote) retryLines.push(`- Citas entre comillas sin fuente`);
    if (hasLiteraryColor) retryLines.push(`- Frases vacías o muletillas: ya las usaste/están prohibidas`);
    if (startsWithTime) retryLines.push(`- Empezaste con la hora (la hora ya aparece como metadato)`);
    if (hasHoraBogota) retryLines.push(`- Mencionaste 'hora Bogotá' / 'hora colombiana' (prohibido)`);
    if (startsWithOnpePercent) retryLines.push(`- Empezaste con "Resultados ONPE al X%…" — ese boletín es ruido auto-generado, NO es noticia. El % ya está visible en el bloque 'Conteo Oficial' arriba.`);
    if (hasOnpeAjustadaTemplate) retryLines.push(`- Usaste la plantilla "Resultados ONPE al X% muestran que la elección sigue ajustada" — exactamente lo que tenés prohibido. Es relleno de máquina.`);
    if (allItemsRegional) retryLines.push(`- TODOS tus ítems son sobre el % regional/nacional del conteo. Eso es lo que el lector YA VE arriba. Buscá otra cosa: declaración, mercado, fact-check, OEA, incidente, hito JNE.`);
    retryLines.push("");
    retryLines.push("REGENERÁ EL PULSO siguiendo TODAS las reglas anteriores Y estos extras:");
    retryLines.push("- NO empezar con la hora.");
    retryLines.push("- NO 'hora Bogotá' / 'hora colombiana'.");
    retryLines.push("- NO mencionar las 122.020 mesas ni los 41,4M electores ni el cierre a las 4 p.m. (ya repetido demasiadas veces).");
    retryLines.push("- TIENE que basarse en uno o más titulares que te paso arriba.");
    retryLines.push("- Si los titulares de hoy hablan de los mismos temas que los pulsos anteriores, ELEGÍ UN ANGULO DISTINTO de un titular distinto. Rebuscatela sin mentir.");
    retryLines.push("- Si después de todo no podés sostener un pulso verificable: escribí 1 frase corta (≤ 20 palabras) sobre algo concreto de UN solo titular del día, sin números genéricos.");
    retryLines.push("");
    retryLines.push("ESCRIBE DE NUEVO:");

    try {
      const retry = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: summary },
          { role: "user", content: retryLines.join("\n") },
        ],
        temperature: 0.3,
        max_tokens: 220,
        response_format: { type: "json_object" },
      });
      const rawRetry = retry.choices[0]?.message?.content?.trim() || "";
      let retrySummary = rawRetry;
      try {
        const outer = JSON.parse(rawRetry) as { summary?: unknown };
        if (typeof outer.summary === "string") retrySummary = outer.summary.trim();
      } catch { /* leave as-is */ }
      retrySummary = unwrapNoise(retrySummary);

      if (retrySummary) {
        const mentioned2 = protectedNames.filter((n) =>
          new RegExp(`\\b${n.replace(/\s+/g, "\\s+")}\\b`, "i").test(retrySummary),
        );
        const ungrounded2 = mentioned2.filter((n) => !headlinesText.includes(n));
        // Re-run the boilerplate checks on the retry — if it ALSO fails, we
        // fall through to the deterministic stub below.
        const retryStartsOnpe = isPE && /^\s*(elecciones\s+per[uú]\s+2026[:\s]+)?resultados\s+onpe\s+al\s+[\d.,]+%/i.test(retrySummary);
        const retryAjustada = isPE && /resultados\s+onpe\s+al\s+[\d.,]+%\s+(muestran|indican?)\s+que\s+la\s+(elecci[oó]n|carrera|contienda)/i.test(retrySummary);
        const retryItems = retrySummary.split(/\s+·\s+/).map((s) => s.trim()).filter(Boolean);
        const retryAllRegional = isPE && retryItems.length >= 1 && retryItems.every((it) =>
          /resultados\s+onpe\s+al\s+[\d.,]+%/i.test(it) ||
          /en\s+\w+,?\s+el\s+conteo\s+oficial.*alcanza\s+el\s+[\d.,]+%/i.test(it),
        );
        if (ungrounded2.length === 0 && !retryStartsOnpe && !retryAjustada && !retryAllRegional) {
          summary = retrySummary;
        } else if (isPE) {
          // Both attempts failed the boilerplate gate. Skip publishing — the
          // user explicitly said "if it's going to start like that, omit".
          summary = "";
        }
      }
    } catch {
      /* keep the original summary if retry fails */
    }

    // Deterministic suppression on PE: if after the retry the summary STILL
    // matches the forbidden opening, drop it entirely. We'd rather have no
    // new pulse than yet another boilerplate one — the contador on the home
    // already shows the live %.
    if (isPE) {
      const stillStartsOnpe = /^\s*(elecciones\s+per[uú]\s+2026[:\s]+)?resultados\s+onpe\s+al\s+[\d.,]+%/i.test(summary);
      const stillAjustada = /resultados\s+onpe\s+al\s+[\d.,]+%\s+(muestran|indican?)\s+que\s+la\s+(elecci[oó]n|carrera|contienda)/i.test(summary);
      if (stillStartsOnpe || stillAjustada) {
        return NextResponse.json({
          ok: true,
          skipped: "boilerplate-rejected",
          rejectedSummary: summary,
        });
      }
    }
  }

  // Final guard: NEVER insert a pulse with an empty summary. Earlier the
  // retry path could leave summary="" (when both attempts failed) and we'd
  // still write an empty row to pulse_updates, surfacing as a ghost entry
  // in the UI ("04:15 p.m. · hace 7 min" with no text). If we have nothing
  // to say, skip — the previous valid pulse stays as the most recent.
  if (!summary || !summary.trim()) {
    return NextResponse.json({
      ok: true,
      skipped: "empty-after-validation",
      reason: fallbackUsed ? "retry-failed" : "model-returned-blank",
    });
  }

  const metrics: Record<string, unknown> = {
    percentage: snap.preconteo?.percentage ?? null,
    counted: snap.preconteo?.counted ?? null,
    total: snap.preconteo?.total ?? null,
    leaderName: snap.preconteo?.leader?.name ?? null,
    leaderPercentage: snap.preconteo?.leader?.percentage ?? null,
    runnerUpName: snap.preconteo?.runnerUp?.name ?? null,
    runnerUpPercentage: snap.preconteo?.runnerUp?.percentage ?? null,
    articlesIn5min: snap.recentArticles.length,
    factChecksRecent: snap.recentFactChecks.length,
    fallbackUsed,
    ungroundedNames,
  };

  // ── Persist ───────────────────────────────────────────────────────────────
  const { data: inserted, error } = await sb
    .from("pulse_updates")
    .insert({
      country_code: country,
      summary,
      metrics,
      phase,
      model: "gpt-4o-mini",
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
    })
    .select("id, generated_at, summary, metrics, phase")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pulse: inserted });
}
