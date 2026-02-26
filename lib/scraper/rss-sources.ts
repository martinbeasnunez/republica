export interface RSSFeedConfig {
  id: string;
  name: string;
  feedUrl: string;
  /** "direct" = source name comes from config; "google-news" = extract real source from <source> XML tag */
  type: "direct" | "google-news";
}

export const RSS_FEEDS: RSSFeedConfig[] = [
  // ── Direct feeds ──
  {
    id: "elcomercio-politica",
    name: "El Comercio",
    feedUrl:
      "https://elcomercio.pe/arc/outboundfeeds/rss/category/politica/?outputType=xml",
    type: "direct",
  },
  {
    id: "rpp",
    name: "RPP Noticias",
    feedUrl: "https://rpp.pe/rss",
    type: "direct",
  },
  {
    id: "gestion-peru",
    name: "Gestion",
    feedUrl:
      "https://gestion.pe/arc/outboundfeeds/rss/category/peru/?outputType=xml",
    type: "direct",
  },

  // ── Google News (meta-agregadores) ──
  // Diversas búsquedas para capturar más fuentes (Infobae, La República, Andina, Peru21, Correo, etc.)
  {
    id: "google-elecciones",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=elecciones+Peru+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "google-candidatos",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=candidatos+presidenciales+Peru+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "google-jne-onpe",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=JNE+ONPE+elecciones+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "google-encuestas-peru",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=encuestas+electorales+Peru+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "google-politica-peru",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=politica+Peru+congreso+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
  {
    id: "google-partidos-peru",
    name: "Google News",
    feedUrl:
      "https://news.google.com/rss/search?q=partidos+politicos+Peru+inscripcion+2026&hl=es&gl=PE&ceid=PE:es",
    type: "google-news",
  },
];
