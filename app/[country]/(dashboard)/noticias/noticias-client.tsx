"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/lib/data/news";
import type { Candidate } from "@/lib/data/candidates";
import { NewsHeroInsight } from "@/components/noticias/news-hero-insight";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";

const factCheckStyles = {
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

const categories = [
  "Todos",
  "Política",
  "Economía",
  "Seguridad",
  "Encuestas",
  "Verificación",
  "Tecnología",
];

export default function NoticiasClient({ articles, candidates }: { articles: NewsArticle[]; candidates: Candidate[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filtered = articles.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "Todos" || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* AI Hero Insight */}
      <NewsHeroInsight articles={articles} candidates={candidates} />

      {/* Search + filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar noticias..."
            className="pl-10 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <WhatsAppCTA context="noticias" />

      {/* Articles */}
      <div className="space-y-3">
        {filtered.map((article, index) => {
          const cardContent = (
            <Card
              className={cn(
                "bg-card border-border transition-all duration-200",
                article.sourceUrl && "hover:border-primary/20 cursor-pointer",
                article.isBreaking && "border-rose/30"
              )}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Breaking badge */}
                    {article.isBreaking && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose">
                          Última hora
                        </span>
                      </div>
                    )}

                    <h3 className={cn(
                      "text-sm font-semibold text-foreground line-clamp-2",
                      article.sourceUrl && "group-hover:text-primary transition-colors"
                    )}>
                      {article.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-[11px] font-medium text-primary">
                        {article.source}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.time}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {article.category}
                      </Badge>
                      {article.candidates.map((c) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className="text-[10px] h-5"
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Fact check + link */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                    {article.factCheck && (
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-md border px-2 py-1",
                          factCheckStyles[article.factCheck].className
                        )}
                      >
                        {(() => {
                          const Icon = factCheckStyles[article.factCheck!].icon;
                          return <Icon className="h-3 w-3" />;
                        })()}
                        <span className="text-[10px] font-medium">
                          {factCheckStyles[article.factCheck].label}
                        </span>
                      </div>
                    )}
                    {article.sourceUrl && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  {cardContent}
                </a>
              ) : (
                cardContent
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
