import { XMLParser } from "fast-xml-parser";
import { type RSSFeedConfig } from "./rss-sources";

export interface RawArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

/**
 * Fetch and parse a single RSS feed into normalized articles.
 * Returns empty array on any error (never throws).
 */
export async function fetchRSSFeed(
  config: RSSFeedConfig
): Promise<RawArticle[]> {
  try {
    const response = await fetch(config.feedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CondorBot/1.0; +https://condorlatam.com)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(
        `[fetchRSS] ${config.id}: HTTP ${response.status}`
      );
      return [];
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);

    // RSS 2.0 structure: rss > channel > item
    const channel = parsed?.rss?.channel;
    if (!channel) {
      console.error(`[fetchRSS] ${config.id}: No channel found`);
      return [];
    }

    // Ensure items is always an array
    const items = Array.isArray(channel.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : [];

    return items
      .map((item: Record<string, unknown>) => {
        const title = cleanText(String(item.title || ""));
        const link = String(item.link || "");
        const pubDate = String(item.pubDate || "");
        const description = cleanText(
          String(item.description || item["media:description"] || "")
        );

        // For Google News, extract the real source name
        let source = config.name;
        if (config.type === "google-news" && item.source) {
          if (typeof item.source === "object" && item.source !== null) {
            source = String(
              (item.source as Record<string, unknown>)["#text"] ||
                (item.source as Record<string, unknown>)["@_url"] ||
                config.name
            );
          } else {
            source = String(item.source);
          }
        }

        return { title, link, pubDate, description, source };
      })
      .filter(
        (a: RawArticle) => a.title.length > 0 && a.link.length > 0
      );
  } catch (err) {
    console.error(`[fetchRSS] ${config.id}: Exception:`, err);
    return [];
  }
}

/**
 * Fetch all configured feeds in parallel.
 */
export async function fetchAllFeeds(
  feeds: RSSFeedConfig[]
): Promise<RawArticle[]> {
  const results = await Promise.allSettled(
    feeds.map((feed) => fetchRSSFeed(feed))
  );

  const allArticles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // Deduplicate by normalized URL within the batch
  const seen = new Set<string>();
  return allArticles.filter((a) => {
    const key = normalizeUrl(a.link);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Strip HTML tags and decode common entities */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize URL for deduplication (remove query params, trailing slash) */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Keep path, remove most query params (but keep essential ones)
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, "");
  }
}
