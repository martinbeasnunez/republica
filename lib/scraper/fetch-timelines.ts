/**
 * Fetch election day "minuto a minuto" timelines from major news sites.
 * Extracts text content from HTML pages and returns it as context for the AI.
 */

const TIMELINE_URLS: Record<string, { name: string; url: string }[]> = {
  pe: [
    { name: "RPP", url: "https://rpp.pe/politica/elecciones/elecciones-2026-mas-de-27-millones-de-peruanos-eligen-a-sus-nuevas-autoridades-live-3316" },
    { name: "El Comercio", url: "https://elcomercio.pe/elecciones/elecciones-2026-en-vivo-hoy-12-de-abril-ultimas-noticias-incidencias-resultados-y-proyeccion-de-segunda-vuelta-electoral-lbposting-noticia/" },
    { name: "Infobae", url: "https://www.infobae.com/peru/2026/04/12/elecciones-peru-2026-en-vivo-hoy-12-de-abril-ultimas-noticias-y-minuto-a-minuto-incidencias-y-resultados-de-las-votaciones-fotos-video/" },
    { name: "Gestión", url: "https://gestion.pe/peru/politica/elecciones-2026-en-peru-en-vivo-asi-se-vive-la-jornada-electoral-de-la-primera-vuelta-quienes-pasan-a-segunda-vuelta-noticia/" },
    { name: "TVPerú", url: "https://www.tvperu.gob.pe/noticias/politica/en-vivo-elecciones-generales-peru-2026-incidencias-cobertura-minuto-a-minuto-y-resultados-este-12-de-abril" },
    { name: "Correo", url: "https://diariocorreo.pe/politica/en-vivo-peru-elecciones-2026-minuto-a-minuto-votacion-incidencias-resultados-local-de-votacion-miembros-de-mesa-candidatos-noticia/" },
  ],
};

export interface TimelineEntry {
  source: string;
  text: string;
}

export interface ParsedTimelineItem {
  time: string;       // "8:03 a.m.", "7:45 a.m."
  text: string;       // The actual content
  source: string;     // "RPP", "El Comercio"
}

/**
 * Fetch and extract text from election day timelines.
 * Returns the combined text as context for the AI briefing generator.
 */
export async function fetchElectionTimelines(
  countryCode: string
): Promise<{ entries: TimelineEntry[]; raw: string; parsed: ParsedTimelineItem[] }> {
  const sources = TIMELINE_URLS[countryCode];
  if (!sources) return { entries: [], raw: "", parsed: [] };

  const entries: TimelineEntry[] = [];
  const structured: ParsedTimelineItem[] = [];

  await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const response = await fetch(source.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; CONDOR-AI/1.0; +https://condorlatam.com)",
            Accept: "text/html",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) return;

        const html = await response.text();

        // Method 1: JSON-LD liveBlogUpdate (Infobae, etc.)
        const jsonLdItems = extractJsonLdLiveblog(html, source.name);
        if (jsonLdItems.length > 0) {
          structured.push(...jsonLdItems);
        }

        // Method 2: HTML <time> tags (RPP)
        const liveblogItems = extractLiveblogItems(html, source.name);
        if (liveblogItems.length > 0) {
          structured.push(...liveblogItems);
        }

        // Also extract raw text for the AI context
        const text = extractText(html);
        const trimmed = text.length > 6000 ? text.slice(-6000) : text;

        if (trimmed.length > 100) {
          entries.push({ source: source.name, text: trimmed });
        }
      } catch {
        // Skip failed fetches silently
      }
    })
  );

  // Combine into a single context string
  const raw = entries
    .map((e) => `[${e.source}]:\n${e.text}`)
    .join("\n\n---\n\n");

  // Use structured liveblog items if available, fall back to text parsing
  let parsed: ParsedTimelineItem[];
  if (structured.length >= 3) {
    // Deduplicate
    const seen = new Set<string>();
    parsed = structured.filter((item) => {
      const key = item.text.slice(0, 40).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 25);
  } else {
    parsed = parseTimelineEntries(entries);
  }

  console.log(
    `[timeline-scraper][${countryCode}] Fetched ${entries.length}/${sources.length} timelines (${raw.length} chars, ${structured.length} structured, ${parsed.length} final)`
  );

  return { entries, raw, parsed };
}

/**
 * Extract liveblog entries from JSON-LD structured data.
 * Works with Infobae and sites that embed liveBlogUpdate in schema.org markup.
 */
function extractJsonLdLiveblog(html: string, source: string): ParsedTimelineItem[] {
  const items: ParsedTimelineItem[] = [];
  try {
    // Extract all JSON-LD blocks — robust approach for large blocks (100KB+)
    const blocks: string[] = [];
    const lower = html.toLowerCase();
    let searchStart = 0;
    while (true) {
      const start = lower.indexOf('application/ld+json', searchStart);
      if (start === -1) break;
      // Find the closing > of the script tag
      const tagClose = html.indexOf('>', start);
      if (tagClose === -1) break;
      const contentStart = tagClose + 1;
      const end = lower.indexOf('</script>', contentStart);
      if (end === -1) break;
      blocks.push(html.slice(contentStart, end).trim());
      searchStart = end + 9;
    }
    if (blocks.length === 0) return items;

    for (const jsonStr of blocks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any;
      try {
        data = JSON.parse(jsonStr);
      } catch {
        // If parse fails (e.g. HTML in strings), try cleaning HTML tags from values
        try {
          // Only strip tags that look like they're inside JSON string values
          const cleaned = jsonStr.replace(/<\/?[a-z][^>]*>/gi, "");
          data = JSON.parse(cleaned);
        } catch { continue; }
      }

      // Find liveBlogUpdate array (can be at root or nested)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updates: any[] = [];
      if (data.liveBlogUpdate) {
        updates = data.liveBlogUpdate;
      } else if (data["@type"] === "LiveBlogPosting" && data.liveBlogUpdate) {
        updates = data.liveBlogUpdate;
      } else if (data["@graph"]) {
        for (const item of data["@graph"]) {
          if (item.liveBlogUpdate) {
            updates = item.liveBlogUpdate;
            break;
          }
        }
      }
      // Deep search — sometimes liveBlogUpdate is nested
      if (updates.length === 0) {
        const jsonStr2 = JSON.stringify(data);
        if (jsonStr2.includes("liveBlogUpdate")) {
          // Find it by walking all keys
          const findUpdates = (obj: Record<string, unknown>): unknown[] => {
            if (Array.isArray(obj)) return obj;
            for (const val of Object.values(obj)) {
              if (Array.isArray(val) && val.length > 0 && val[0]?.headline) return val;
              if (typeof val === "object" && val !== null) {
                const found = findUpdates(val as Record<string, unknown>);
                if (found.length > 0) return found;
              }
            }
            return [];
          };
          updates = findUpdates(data) as typeof updates;
        }
      }

      for (const update of updates) {
        const text = (update.headline || update.articleBody || "").trim();
        if (text.length < 15 || text.length > 300) continue;

        // Parse ISO date to Peru time
        let time = "";
        if (update.datePublished) {
          try {
            const d = new Date(update.datePublished);
            const peruStr = d.toLocaleString("en-US", { timeZone: "America/Lima", hour: "numeric", minute: "2-digit", hour12: true });
            // Convert "9:14 AM" -> "9:14 a.m."
            time = peruStr.replace(" AM", " a.m.").replace(" PM", " p.m.");
          } catch { continue; }
        }

        if (time) {
          items.push({ time, text, source });
        }
      }
    }
  } catch { /* JSON parse error — skip */ }

  return items;
}

/**
 * Extract structured liveblog items from HTML using <time> tags.
 * Works with RPP, El Comercio and similar formats.
 */
function extractLiveblogItems(html: string, source: string): ParsedTimelineItem[] {
  const items: ParsedTimelineItem[] = [];

  // Pattern: <time>...</time> followed by content until next <time> or end
  const blocks = html.match(/<time[^>]*>[\s\S]*?<\/time>[\s\S]*?(?=<time|<\/article|$)/gi);
  if (!blocks) return items;

  const now = new Date();
  const peruNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
  const peruHour = peruNow.getHours();
  const peruMinute = peruNow.getMinutes();

  for (const block of blocks) {
    // Extract time text
    const timeMatch = block.match(/<time[^>]*>([\s\S]*?)<\/time>/i);
    if (!timeMatch) continue;
    const rawTime = timeMatch[1].replace(/<[^>]+>/g, "").trim();

    // Extract content after </time>
    const contentStart = block.indexOf("</time>") + 7;
    let content = block.slice(contentStart);
    content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
    content = content.replace(/<style[\s\S]*?<\/style>/gi, "");
    content = content.replace(/<[^>]+>/g, " ");
    content = content.replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é").replace(/&iacute;/gi, "í").replace(/&oacute;/gi, "ó").replace(/&uacute;/gi, "ú").replace(/&ntilde;/gi, "ñ").replace(/&iquest;/gi, "¿");
    content = content.replace(/&\w+;/g, " ");
    content = content.replace(/\s+/g, " ").trim();

    if (content.length < 20 || content.length > 400) continue;

    // Normalize time
    let time = rawTime;
    if (rawTime.toLowerCase() === "ahora") {
      time = `${peruHour}:${String(peruMinute).padStart(2, "0")} ${peruHour < 12 ? "a.m." : "p.m."}`;
    } else if (rawTime.toLowerCase().startsWith("hace")) {
      const minMatch = rawTime.match(/(\d+)\s*min/i);
      const hourMatch = rawTime.match(/(\d+)\s*hora/i);
      if (minMatch) {
        const mins = parseInt(minMatch[1]);
        const d = new Date(peruNow.getTime() - mins * 60000);
        time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "a.m." : "p.m."}`;
      } else if (hourMatch) {
        const hrs = parseInt(hourMatch[1]);
        const d = new Date(peruNow.getTime() - hrs * 3600000);
        time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "a.m." : "p.m."}`;
      }
    } else {
      // Try to extract HH:MM pattern
      const hmMatch = rawTime.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|AM|PM)?/i);
      if (hmMatch) {
        const period = hmMatch[3] ? hmMatch[3].replace(/\s/g, "").toLowerCase() : "";
        time = `${hmMatch[1]}:${hmMatch[2]} ${period.startsWith("p") ? "p.m." : "a.m."}`;
      }
    }

    // Cap content
    if (content.length > 180) content = content.slice(0, 177) + "...";

    items.push({ time, text: content, source });
  }

  return items;
}

/**
 * Extract timestamped entries from timeline text.
 * Peruvian media uses many formats:
 * "4:45 a.m. en Arequipa, reportó la ONPE"
 * "A las 7:00 a.m. inició oficialmente..."
 * "06:08 de la mañana con la instalación..."
 * "7:30 a.m. al colegio..."
 */
function parseTimelineEntries(entries: TimelineEntry[]): ParsedTimelineItem[] {
  const items: ParsedTimelineItem[] = [];

  for (const entry of entries) {
    const lines = entry.text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 30 || trimmed.length > 500) continue;

      // Multiple regex patterns to catch different formats
      const patterns = [
        // "4:45 a.m." or "7:00 a. m." or "06:08" or "8:56 AM"
        /(\d{1,2}:\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|AM|PM)/i,
        // "las 7:00" or "las 06:08"
        /las\s+(\d{1,2}:\d{2})/i,
        // "06:08 de la mañana"
        /(\d{1,2}:\d{2})\s+de\s+la\s+(mañana|tarde|noche)/i,
      ];

      for (const regex of patterns) {
        const match = regex.exec(trimmed);
        if (match) {
          const rawTime = match[1];
          const period = match[2] || "";
          let time = rawTime;

          // Normalize time display
          const cleanPeriod = period.replace(/\s|\./g, "").toLowerCase();
          if (cleanPeriod.startsWith("a") || cleanPeriod === "" || period.toLowerCase().includes("mañana")) {
            time = rawTime + " a.m.";
          } else if (cleanPeriod.startsWith("p") || period.toLowerCase().includes("tarde") || period.toLowerCase().includes("noche")) {
            time = rawTime + " p.m.";
          }

          // Extract text AFTER the timestamp
          const matchEnd = match.index + match[0].length;
          let text = trimmed.slice(matchEnd).trim();
          // If text starts with punctuation/connectors, clean up
          text = text.replace(/^[—\-–|:.,·]\s*/, "").trim();
          // If we cut too much, use the full line but clean it
          if (text.length < 20) {
            text = trimmed.replace(/^\d{1,2}\s+de\s+\w+\s+del?\s+\d{4}\s*/i, "").trim();
          }
          // Cap length
          if (text.length > 200) text = text.slice(0, 197) + "...";

          if (text.length > 25) {
            items.push({ time, text, source: entry.source });
          }
          break; // Only match first pattern per line
        }
      }
    }
  }

  // Sort by time descending (most recent first)
  items.sort((a, b) => {
    const parseTime = (t: string) => {
      const parts = t.match(/(\d{1,2}):(\d{2})/);
      if (!parts) return 0;
      let h = parseInt(parts[1]);
      const m = parseInt(parts[2]);
      const isPM = t.toLowerCase().includes("p.m");
      const isAM = t.toLowerCase().includes("a.m");
      if (isPM && h !== 12) h += 12;
      if (isAM && h === 12) h = 0;
      return h * 60 + m;
    };
    return parseTime(b.time) - parseTime(a.time);
  });

  // Deduplicate — entries with similar text (first 40 chars)
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.text.slice(0, 40).toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 25);
}

/**
 * Simple HTML → text extraction.
 * Strips tags, scripts, styles, and collapses whitespace.
 */
function extractText(html: string): string {
  return html
    // Remove script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Convert common block elements to newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|br\s*\/?)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Remove all remaining tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&iquest;/gi, "¿")
    .replace(/&iexcl;/gi, "¡")
    // Collapse whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}
