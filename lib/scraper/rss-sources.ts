import type { CountryCode } from "@/lib/config/countries";

export interface RSSFeedConfig {
  id: string;
  name: string;
  feedUrl: string;
  /** "direct" = source name comes from config; "google-news" = extract real source from <source> XML tag */
  type: "direct" | "google-news";
}

// =============================================================================
// PERU RSS FEEDS
// =============================================================================

const PERU_FEEDS: RSSFeedConfig[] = [
  // ── Direct feeds ──
  {
    id: "pe-elcomercio-politica",
    name: "El Comercio",
    feedUrl:
      "https://elcomercio.pe/arc/outboundfeeds/rss/category/politica/?outputType=xml",
    type: "direct",
  },
  {
    id: "pe-rpp",
    name: "RPP Noticias",
    feedUrl: "https://rpp.pe/rss",
    type: "direct",
  },
  {
    id: "pe-gestion-peru",
    name: "Gestion",
    feedUrl:
      "https://gestion.pe/arc/outboundfeeds/rss/category/peru/?outputType=xml",
    type: "direct",
  },
  // ── Google News (meta-agregadores) ──
  {
    id: "pe-google-elecciones",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=elecciones+Peru+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "pe-google-candidatos",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=candidatos+presidenciales+Peru+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "pe-google-jne-onpe",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=JNE+ONPE+elecciones+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "pe-google-encuestas",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=encuestas+electorales+Peru+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "pe-google-politica",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=politica+Peru+congreso+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "pe-google-partidos",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=partidos+politicos+Peru+inscripcion+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
];

// =============================================================================
// COLOMBIA RSS FEEDS
// =============================================================================

const COLOMBIA_FEEDS: RSSFeedConfig[] = [
  // ── Direct feeds ──
  {
    id: "co-eltiempo-politica",
    name: "El Tiempo",
    feedUrl: "https://www.eltiempo.com/rss/politica.xml",
    type: "direct",
  },
  {
    id: "co-elespectador-politica",
    name: "El Espectador",
    feedUrl: "https://www.elespectador.com/rss/politica.xml",
    type: "direct",
  },
  // ── Google News (meta-agregadores) ──
  {
    id: "co-google-elecciones",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=elecciones+Colombia+2026&hl=es&gl=CO&ceid=CO:es",
    type: "google-news",
  },
  {
    id: "co-google-candidatos",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=candidatos+presidenciales+Colombia+2026&hl=es&gl=CO&ceid=CO:es",
    type: "google-news",
  },
  {
    id: "co-google-encuestas",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=encuestas+electorales+Colombia+2026&hl=es&gl=CO&ceid=CO:es",
    type: "google-news",
  },
  {
    id: "co-google-registraduria",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=Registraduria+CNE+elecciones+Colombia+2026&hl=es&gl=CO&ceid=CO:es",
    type: "google-news",
  },
  {
    id: "co-google-politica",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=politica+Colombia+congreso+2026&hl=es&gl=CO&ceid=CO:es",
    type: "google-news",
  },
];

// =============================================================================
// REGISTRY
// =============================================================================

const FEEDS_BY_COUNTRY: Record<CountryCode, RSSFeedConfig[]> = {
  pe: PERU_FEEDS,
  co: COLOMBIA_FEEDS,
};

/**
 * Get RSS feeds for a specific country.
 * Returns all feeds if no country specified.
 */
export function getRssFeeds(countryCode?: CountryCode): RSSFeedConfig[] {
  if (countryCode) {
    return FEEDS_BY_COUNTRY[countryCode] || [];
  }
  return Object.values(FEEDS_BY_COUNTRY).flat();
}

/**
 * @deprecated Use getRssFeeds() instead. Kept for backward compatibility.
 */
export const RSS_FEEDS: RSSFeedConfig[] = PERU_FEEDS;
