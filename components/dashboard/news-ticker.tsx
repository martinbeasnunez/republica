"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type NewsArticle } from "@/lib/data/news";
import { useCountry } from "@/lib/config/country-context";

const factCheckConfig = {
  verified: {
    icon: ShieldCheck,
    label: "Verificado",
    className: "text-emerald bg-emerald/10 border-emerald/20",
  },
  questionable: {
    icon: AlertTriangle,
    label: "Cuestionable",
    className: "text-amber bg-amber/10 border-amber/20",
  },
  false: {
    icon: AlertTriangle,
    label: "Falso",
    className: "text-rose bg-rose/10 border-rose/20",
  },
};

interface NewsTickerProps {
  articles: NewsArticle[];
}

export function NewsTicker({ articles }: NewsTickerProps) {
  const country = useCountry();
  // Show up to 6 most recent articles
  const displayArticles = articles.slice(0, 6);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
          <h3 className="text-sm font-semibold text-foreground">
            Noticias en Tiempo Real
          </h3>
        </div>
        <a
          href={`/${country.code}/noticias`}
          className="text-xs font-medium text-primary hover:text-indigo-glow transition-colors"
        >
          Ver todas →
        </a>
      </div>

      <div className="divide-y divide-border">
        {displayArticles.map((news, index) => {
          const firstCandidate =
            news.candidates.length > 0 ? news.candidates[0] : undefined;

          const content = (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {news.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {news.source}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {news.time}
                  </span>
                  {firstCandidate && (
                    <Badge
                      variant="secondary"
                      className="h-5 text-[10px] px-1.5"
                    >
                      {firstCandidate}
                    </Badge>
                  )}
                </div>
              </div>

              {news.factCheck && factCheckConfig[news.factCheck] && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium",
                    factCheckConfig[news.factCheck].className
                  )}
                >
                  {(() => {
                    const Icon = factCheckConfig[news.factCheck!].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {factCheckConfig[news.factCheck].label}
                </div>
              )}

              {news.sourceUrl && (
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5" />
              )}
            </>
          );

          return news.sourceUrl ? (
            <motion.a
              key={news.id}
              href={news.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer"
            >
              {content}
            </motion.a>
          ) : (
            <motion.div
              key={news.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group flex items-start gap-3 px-4 py-3"
            >
              {content}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
