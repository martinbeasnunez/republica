import * as cheerio from "cheerio";
import type { CheerioAPI, Cheerio } from "cheerio";
import type { AnyNode } from "domhandler";
import type { CountryCode } from "@/lib/config/countries";

/**
 * Wikipedia Anexo Scraper — deterministic poll data extractor.
 *
 * Source: es.wikipedia.org "Anexo:Sondeos de intención de voto..." pages.
 * These tables are the most authoritative public aggregation of LATAM
 * election polls, edited collectively with strict sourcing rules and
 * inline citations to each primary source.
 *
 * This file is pure parsing — no AI, no inference, no fallbacks.
 * If anything looks wrong, the row is dropped and logged by the caller.
 */

// =============================================================================
// CONFIG
// =============================================================================

/**
 * Per-country scrape target. `tableHeading` selects which wikitable to parse
 * via its nearest preceding h2/h3/h4. `candidateAliases` is an explicit map
 * from the Wikipedia column header text to the DB `candidate_id`.
 *
 * Columns NOT present in `candidateAliases` are silently ignored (fail-safe).
 * This prevents fuzzy-matching accidents like "López ED" vs "López Ind." both
 * collapsing into the same DB candidate.
 */
export interface WikiSourceConfig {
  url: string;
  /** Heading (h2/h3/h4) of the single canonical table to extract */
  tableHeading: string;
  /** Wikipedia header text → DB candidate_id. Case-insensitive, diacritics-insensitive */
  candidateAliases: Record<string, string>;
}

export const WIKI_SOURCES: Record<CountryCode, WikiSourceConfig> = {
  co: {
    url: "https://es.wikipedia.org/wiki/Anexo:Sondeos_de_intenci%C3%B3n_de_voto_para_las_elecciones_presidenciales_de_Colombia_de_2026",
    tableHeading: "Oficialización de candidaturas",
    // Wikipedia concatenates surname + party abbreviation without spaces
    // (e.g. "BarrerasLF", "De La EspriellaInd."). Aliases match the
    // post-normalizeHeader form: diacritic-free, lowercased, single spaces.
    candidateAliases: {
      "barreraslf": "co-roy-barreras",
      "cepedaph": "co-ivan-cepeda",
      "de la espriellaind.": "co-abelardo-de-la-espriella",
      "fajardod&c": "co-sergio-fajardo",
      // Claudia López runs as Imparables (Ind.). "LópezED" is a different
      // López (Equipo por la Dignidad) — intentionally left unmapped.
      "lopezind.": "co-claudia-lopez",
      "valenciacd": "co-paloma-valencia",
    },
  },
  pe: {
    url: "https://es.wikipedia.org/wiki/Anexo:Sondeos_de_intenci%C3%B3n_de_voto_para_las_elecciones_presidenciales_de_Per%C3%BA_de_2026",
    tableHeading: "Intención de voto",
    candidateAliases: {
      "lopez aliaga": "1",
      "fujimori": "2",
      "acuna": "3",
      "vizcarra": "4",
      "alvarez": "5",
      "lopez chau": "6",
      "forsyth": "7",
      "luna": "8",
      "nieto": "jorge-nieto",
      "grozo": "wolfgang-grozo",
      "lescano": "yonhy-lescano",
      "sanchez": "roberto-sanchez",
      "belmont": "ricardo-belmont",
      "olivera": "fernando-olivera",
      "chiabra": "roberto-chiabra",
      "perez": "marisol-perez-tello",
      "atencio": "ronald-atencio",
      "valder.": "pitter-valderrama",
      "belaun.": "rafael-belaunde",
      "cerron": "vladimir-cerron",
      "espa": "alfonso-espa",
      "williams": "jose-williams",
      "fernan.ucd": "rosario-fernandez",
      "jaimes": "paul-jaimes",
      "diez canseco": "francisco-diez-canseco",
      "masse": "armando-masse",
      "molinelli": "fiorella-molinelli",
      "gonzal.": "alex-gonzales",
      "guevara": "mesias-guevara",
      "jaico": "carlos-jaico",
      "chirinos": "walter-chirinos",
      "carrasco": "charlie-carrasco",
      "paz dela barra": "alvaro-paz-de-la-barra",
      "caller": "herbert-caller",
      "ortiz": "antonio-ortiz",
      "becerra (†)": "napoleon-becerra",
    },
  },
};

// =============================================================================
// PUBLIC TYPES
// =============================================================================

export interface RawPollRow {
  pollster: string;
  field_start: string | null; // ISO YYYY-MM-DD
  field_end: string; // ISO YYYY-MM-DD
  sample_size: number | null;
  source_url: string;
  /** Map of DB candidate_id → percentage (0-100) */
  shares: Record<string, number>;
}

// =============================================================================
// FETCH
// =============================================================================

const USER_AGENT = "CONDOR/1.0 (https://condorlatam.com; admin@condorlatam.com)";

export async function fetchWikipediaAnexo(
  country: CountryCode
): Promise<{ html: string; url: string; fetchedAt: string }> {
  const cfg = WIKI_SOURCES[country];
  if (!cfg) throw new Error(`No wiki source for country ${country}`);

  const res = await fetch(cfg.url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    // Revalidate every 6 hours
    next: { revalidate: 6 * 60 * 60 },
  });
  if (!res.ok) {
    throw new Error(`Wikipedia fetch failed: ${res.status} ${res.statusText}`);
  }
  return { html: await res.text(), url: cfg.url, fetchedAt: new Date().toISOString() };
}

// =============================================================================
// LOGICAL GRID (handles rowspan/colspan)
// =============================================================================

type LogicalCell = { el: AnyNode; originRow: number };

function buildLogicalGrid($: CheerioAPI, $table: Cheerio<AnyNode>): LogicalCell[][] {
  const rows = $table.find("> tbody > tr").toArray();
  const physicalRows = rows.length > 0 ? rows : $table.find("> tr").toArray();
  const grid: LogicalCell[][] = [];
  // carryOver[colIdx] = { cell, remainingRows }
  const carry: Record<number, { el: AnyNode; remaining: number; originRow: number }> = {};

  for (let r = 0; r < physicalRows.length; r++) {
    const row = physicalRows[r];
    const logical: LogicalCell[] = [];
    let col = 0;
    const physical = $(row).children("th, td").toArray();
    let pIdx = 0;

    while (true) {
      // Emit any carried-over cell at this column
      if (carry[col]) {
        logical.push({ el: carry[col].el, originRow: carry[col].originRow });
        carry[col].remaining--;
        if (carry[col].remaining <= 0) delete carry[col];
        col++;
        continue;
      }
      if (pIdx >= physical.length) break;

      const cell = physical[pIdx++];
      const rs = parseInt($(cell).attr("rowspan") || "1", 10) || 1;
      const cs = parseInt($(cell).attr("colspan") || "1", 10) || 1;

      for (let k = 0; k < cs; k++) {
        logical.push({ el: cell, originRow: r });
        if (rs > 1) {
          carry[col] = { el: cell, remaining: rs - 1, originRow: r };
        }
        col++;
      }
    }
    grid.push(logical);
  }
  return grid;
}

// =============================================================================
// TEXT HELPERS
// =============================================================================

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeHeader(s: string): string {
  return stripDiacritics(s).toLowerCase().trim().replace(/\s+/g, " ");
}

function stripCitations(s: string): string {
  // Remove [N] and [letter] citation markers, e.g. "Atlas Intel[22]" → "Atlas Intel"
  return s.replace(/\[[^\]]*\]/g, "").trim();
}

function parsePercentage(text: string): number | null {
  const cleaned = text.replace(/[%\s]/g, "").replace(",", ".").trim();
  if (!cleaned || cleaned === "-" || cleaned === "—" || cleaned === "–" || cleaned === "?") {
    return null;
  }
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseSampleSize(text: string): number | null {
  const cleaned = text.replace(/[.,\s]/g, "").trim();
  if (!cleaned || cleaned === "?" || cleaned === "-" || cleaned === "—") return null;
  const n = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const SPANISH_MONTHS: Record<string, number> = {
  ene: 1, enero: 1,
  feb: 2, febrero: 2,
  mar: 3, marzo: 3,
  abr: 4, abril: 4,
  may: 5, mayo: 5,
  jun: 6, junio: 6,
  jul: 7, julio: 7,
  ago: 8, agosto: 8,
  sep: 9, sept: 9, septiembre: 9, setiembre: 9,
  oct: 10, octubre: 10,
  nov: 11, noviembre: 11,
  dic: 12, diciembre: 12,
};

/**
 * Parse Spanish date range text from Wikipedia. Supported forms:
 *   "6-9 Abr 2026"
 *   "23-28 Feb"  (year inferred from a reference year)
 *   "19-25 Feb 2026"
 *   "8 abr 2026"
 *   "8 de abril de 2026"
 *   "1 Mar - 3 Mar 2026"
 *
 * Returns `field_end` as ISO date; `field_start` if a range.
 * Requires `referenceYear` when the text omits a year.
 */
export function parseDateRange(
  text: string,
  referenceYear: number
): { field_start: string | null; field_end: string } | null {
  const raw = stripDiacritics(text).toLowerCase().replace(/\s+/g, " ").trim();
  if (!raw || raw === "?" || raw === "-") return null;

  // Strip filler words
  const cleaned = raw.replace(/\bde\b/g, " ").replace(/\s+/g, " ").trim();

  // Extract explicit year (4 digits), if any
  const yearMatch = cleaned.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : referenceYear;

  // Remove year from working text
  const noYear = cleaned.replace(/\b20\d{2}\b/, "").trim();

  // Try to find month token
  const monthMatch = noYear.match(/([a-z]{3,}\.?)/);
  if (!monthMatch) return null;
  const monthKey = monthMatch[1].replace(/\./g, "");
  const monthNum = SPANISH_MONTHS[monthKey] ?? SPANISH_MONTHS[monthKey.slice(0, 3)];
  if (!monthNum) return null;

  // Extract day or day range (before the month or after)
  // Supports: "6-9 abr", "6 a 9 abr", "abr 6-9", "8 abr"
  const daysText = noYear.replace(monthMatch[0], "").trim();
  const dayRangeMatch = daysText.match(/(\d{1,2})\s*(?:-|–|a|al)\s*(\d{1,2})/);
  const singleDayMatch = daysText.match(/(\d{1,2})/);
  if (!dayRangeMatch && !singleDayMatch) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

  if (dayRangeMatch) {
    const d1 = parseInt(dayRangeMatch[1], 10);
    const d2 = parseInt(dayRangeMatch[2], 10);
    if (d1 < 1 || d1 > 31 || d2 < 1 || d2 > 31) return null;
    return {
      field_start: iso(year, monthNum, d1),
      field_end: iso(year, monthNum, d2),
    };
  }
  const d = parseInt(singleDayMatch![1], 10);
  if (d < 1 || d > 31) return null;
  return { field_start: null, field_end: iso(year, monthNum, d) };
}

// =============================================================================
// PARSE
// =============================================================================

/**
 * Find the wikitable that immediately follows the section heading matching
 * `tableHeading` (case-insensitive contains match).
 */
function findTargetTable(
  $: CheerioAPI,
  tableHeading: string
): Cheerio<AnyNode> | null {
  const target = normalizeHeader(tableHeading);
  const els = $("h2, h3, h4, table.wikitable").toArray();
  let currentHeading = "";
  for (const el of els) {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase();
    if (tag === "h2" || tag === "h3" || tag === "h4") {
      currentHeading = normalizeHeader(
        $(el).text().replace(/\[editar\]/g, "")
      );
    } else if (tag === "table") {
      if (currentHeading.includes(target)) {
        return $(el);
      }
    }
  }
  return null;
}

/**
 * Resolve a citation footnote URL. Wikipedia cites look like `[22]` with
 * an `<a href="#cite_note-:17-22">` → jumps to a footnote `<li id="cite_note-:17-22">`
 * whose first `<a class="external">` contains the primary source URL.
 */
function resolveFirstCitationUrl(
  $: CheerioAPI,
  $cell: Cheerio<AnyNode>
): string | null {
  const sup = $cell.find("sup.reference a").first();
  const href = sup.attr("href");
  if (!href || !href.startsWith("#")) return null;
  const noteId = href.slice(1);
  // Use attribute selector to avoid CSS.escape (browser API not in Node)
  const note = $(`[id="${noteId.replace(/"/g, '\\"')}"]`);
  if (note.length === 0) return null;
  const extLink = note.find("a.external").first();
  const url = extLink.attr("href");
  return url || null;
}

/**
 * Parse the target wikitable for a country.
 * Returns one RawPollRow per data row (multi-scenario rowspan pollsters
 * are collapsed to the first scenario — the headline result).
 */
export function parseWikipediaAnexo(
  html: string,
  country: CountryCode,
  referenceYear: number = new Date().getUTCFullYear()
): RawPollRow[] {
  const $ = cheerio.load(html);
  const cfg = WIKI_SOURCES[country];
  const $table = findTargetTable($, cfg.tableHeading);
  if (!$table || $table.length === 0) {
    throw new Error(
      `Could not find wikitable under heading "${cfg.tableHeading}" for ${country}`
    );
  }

  const grid = buildLogicalGrid($, $table);
  if (grid.length < 3) return []; // need at least 2 header rows + 1 data row

  // ─── Determine column indexes via fixed positions ────────────────
  // Col 0 = pollster, Col 1 = fecha, Col 2 = muestra.
  // Candidate columns start at col 3 and extend until a "meta" column
  // (Otr., Blan., Nin, NS/NR, Margen de Error) is encountered.
  // Column headers live in grid[0] (top row, which has rowspan for meta cols
  // but blank cells for the candidate range because row[1] holds the names).

  const row0 = grid[0];
  const row1 = grid[1];

  // Find the left bound of the "meta" columns by scanning row0 text for
  // "otr", "blan", "nin", "ns/nr", "margen". The first match marks the end
  // of the candidate range.
  let metaStart = row0.length;
  for (let i = 3; i < row0.length; i++) {
    const text = normalizeHeader($(row0[i].el).text());
    if (
      text.includes("otr") ||
      text.includes("blan") ||
      text.includes("nin") ||
      text.includes("ns/nr") ||
      text.includes("margen")
    ) {
      metaStart = i;
      break;
    }
  }

  // Map candidate column index → DB candidate_id (via alias map)
  const aliasMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(cfg.candidateAliases)) {
    aliasMap[normalizeHeader(k)] = v;
  }
  const colToCandidate: Record<number, string> = {};
  for (let i = 3; i < metaStart; i++) {
    const headerText = normalizeHeader(
      stripCitations($(row1[i].el).text())
    );
    const mapped = aliasMap[headerText];
    if (mapped) colToCandidate[i] = mapped;
  }

  // ─── Parse data rows ────────────────────────────────────────────
  const results: RawPollRow[] = [];
  const seenOrigins = new Set<number>(); // to dedupe multi-scenario rowspans

  for (let r = 2; r < grid.length; r++) {
    const row = grid[r];
    if (row.length < 3) continue;

    // Check first cell: skip event rows (th instead of td, or non-pollster text)
    const firstCell = row[0].el as unknown as { tagName?: string };
    if (firstCell.tagName?.toLowerCase() === "th") continue;

    const originRow = row[0].originRow;
    // If this origin row has already contributed a result, this is a
    // multi-scenario continuation row for the same pollster → skip.
    if (seenOrigins.has(originRow)) continue;

    const $pollsterCell = $(row[0].el);
    const pollsterRaw = stripCitations($pollsterCell.text()).replace(/\s+/g, " ").trim();
    if (!pollsterRaw || pollsterRaw === "—" || pollsterRaw === "-" || /^\d/.test(pollsterRaw)) {
      // Blank, em-dash, or "6 de abril..." event row
      continue;
    }

    const dateText = $(row[1].el).text().replace(/\s+/g, " ").trim();
    const dateParsed = parseDateRange(dateText, referenceYear);
    if (!dateParsed) continue;

    const sampleText = $(row[2].el).text();
    const sampleSize = parseSampleSize(sampleText);

    const shares: Record<string, number> = {};
    for (const [colIdxStr, candidateId] of Object.entries(colToCandidate)) {
      const colIdx = parseInt(colIdxStr, 10);
      if (colIdx >= row.length) continue;
      const val = parsePercentage($(row[colIdx].el).text());
      if (val !== null) shares[candidateId] = val;
    }

    // Resolve primary source URL from the pollster cell's citation
    const citationUrl = resolveFirstCitationUrl($, $pollsterCell);
    const sourceUrl = citationUrl || WIKI_SOURCES[country].url;

    results.push({
      pollster: pollsterRaw,
      field_start: dateParsed.field_start,
      field_end: dateParsed.field_end,
      sample_size: sampleSize,
      source_url: sourceUrl,
      shares,
    });
    seenOrigins.add(originRow);
  }

  return results;
}
