"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ExternalLink, ShieldCheck, AlertTriangle, ChevronDown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { NewsArticle } from "@/lib/data/news";
import Link from "next/link";

const factCheckConfig = {
  verified: { icon: ShieldCheck, label: "Verificado", className: "text-emerald bg-emerald/10 border-emerald/20" },
  questionable: { icon: AlertTriangle, label: "Cuestionable", className: "text-amber bg-amber/10 border-amber/20" },
  false: { icon: AlertTriangle, label: "Falso", className: "text-rose bg-rose/10 border-rose/20" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface CandidatePhoto {
  shortName: string;
  name: string;
  photo: string;
  partyColor: string;
}

interface LiveNewsFeedProps {
  articles: NewsArticle[];
  candidatePhotos?: CandidatePhoto[];
}

export function LiveNewsFeed({ articles: initialArticles, candidatePhotos = [] }: LiveNewsFeedProps) {
  const country = useCountry();
  const [articles, setArticles] = useState(initialArticles);
  const [expanded, setExpanded] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const mountedRef = useRef(false);

  // Real-time subscription for new articles
  useEffect(() => {
    mountedRef.current = true;
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const channel = sb
      .channel("live-news")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_articles", filter: `country_code=eq.${country.code}` },
        (payload) => {
          if (!mountedRef.current) return;
          const row = payload.new;
          const newArticle: NewsArticle = {
            id: row.id,
            title: row.title,
            summary: row.summary,
            source: row.source,
            sourceUrl: row.source_url || undefined,
            time: row.published_at,
            category: row.category,
            factCheck: row.fact_check || undefined,
            candidates: row.candidates_mentioned || [],
            imageUrl: row.image_url || undefined,
            isBreaking: row.is_breaking || false,
          };
          setArticles((prev) => [newArticle, ...prev]);
          setNewCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      sb.removeChannel(channel);
    };
  }, [country.code]);

  // "Última hora" sólo si: scraper la marcó como breaking Y el artículo es realmente reciente.
  // 30 min es el umbral — pasa a noticia regular después.
  const BREAKING_MAX_AGE_MS = 30 * 60 * 1000;
  const isFresh = (a: NewsArticle) => {
    if (!a.time) return false;
    const t = new Date(a.time).getTime();
    return Number.isFinite(t) && Date.now() - t < BREAKING_MAX_AGE_MS;
  };
  const breaking = articles.filter((a) => a.isBreaking && isFresh(a));
  const regular = articles.filter((a) => !breaking.includes(a));
  const displayLimit = expanded ? 20 : 8;
  const displayArticles = [...breaking, ...regular].slice(0, displayLimit);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
          <h2 className="text-sm font-bold text-foreground">Noticias en Tiempo Real</h2>
          {newCount > 0 && (
            <span className="rounded-full bg-rose/10 text-rose text-[10px] font-bold px-2 py-0.5">
              +{newCount} nuevas
            </span>
          )}
        </div>
        <Link
          href={`/${country.code}/noticias`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver todas →
        </Link>
      </div>

      {/* Articles */}
      <div className="divide-y divide-border">
        <AnimatePresence initial={false}>
          {displayArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <ArticleRow article={article} featured={index < 3} candidatePhotos={candidatePhotos} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expand button */}
      {articles.length > 8 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-primary hover:bg-accent/50 transition-colors border-t border-border"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Ver más noticias ({articles.length - 8} más)
        </button>
      )}
    </div>
  );
}

function ArticleRow({ article, candidatePhotos = [] }: { article: NewsArticle; featured?: boolean; candidatePhotos?: CandidatePhoto[] }) {
  // Show "Última hora" only when it's actually fresh — 30 min cap.
  const BREAKING_MAX_AGE_MS = 30 * 60 * 1000;
  const articleAge = article.time ? Date.now() - new Date(article.time).getTime() : Infinity;
  const isBreaking = article.isBreaking && articleAge < BREAKING_MAX_AGE_MS;
  const firstCandidate = article.candidates.length > 0 ? article.candidates[0] : undefined;

  // Match candidate photo from article mentions
  const matchedCandidate = candidatePhotos.find((c) => {
    const names = [c.shortName.toLowerCase(), ...c.name.toLowerCase().split(" ")];
    return names.some((n) => n.length > 3 && article.title.toLowerCase().includes(n));
  });

  const content = (
    <div className={cn(
      "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/50 group",
      isBreaking && "bg-red-50/50 border-l-2 border-red-500"
    )}>
      {/* Candidate photo or article image */}
      {matchedCandidate ? (
        <div className="flex-shrink-0 relative">
          <img
            src={matchedCandidate.photo}
            alt={matchedCandidate.shortName}
            className="h-10 w-10 rounded-full object-cover ring-2"
            style={{ borderColor: matchedCandidate.partyColor }}
          />
        </div>
      ) : article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt=""
          className="flex-shrink-0 w-14 h-14 rounded-lg object-cover"
        />
      ) : null}

      <div className="flex-1 min-w-0">
        {/* Breaking badge */}
        {isBreaking && (
          <div className="flex items-center gap-1 mb-1">
            <Zap className="h-3 w-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Última hora</span>
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {article.title}
        </p>

          {/* Meta row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground">{article.source}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo(article.time)}
            </span>
            {firstCandidate && (
              <Badge variant="secondary" className="h-5 text-[10px] px-1.5">{firstCandidate}</Badge>
            )}
            {article.category && (
              <span className="text-[10px] text-muted-foreground/60">{article.category}</span>
            )}
          </div>
        </div>

        {/* Fact check badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {article.factCheck && factCheckConfig[article.factCheck] && (
            <div className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium",
              factCheckConfig[article.factCheck].className
            )}>
              {(() => {
                const Icon = factCheckConfig[article.factCheck!].icon;
                return <Icon className="h-3 w-3" />;
              })()}
              {factCheckConfig[article.factCheck].label}
            </div>
          )}
          {article.sourceUrl && (
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
  );

  if (article.sourceUrl) {
    return (
      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
