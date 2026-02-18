"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: "politica" | "economia" | "seguridad" | "social";
  factCheck?: "verified" | "questionable" | "false";
  candidateMentioned?: string;
  url?: string;
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "JNE confirma 36 candidatos habilitados para elecciones presidenciales 2026",
    source: "El Comercio",
    time: "Hace 2h",
    category: "politica",
    factCheck: "verified",
    url: "https://elcomercio.pe",
  },
  {
    id: "2",
    title: "Nueva encuesta IEP: Lopez Aliaga mantiene ventaja con 12.3%",
    source: "RPP",
    time: "Hace 3h",
    category: "politica",
    candidateMentioned: "Lopez Aliaga",
    factCheck: "verified",
    url: "https://rpp.pe",
  },
  {
    id: "3",
    title: "Debate presidencial se realizara el 15 de marzo en Lima",
    source: "La Republica",
    time: "Hace 5h",
    category: "politica",
    factCheck: "verified",
    url: "https://larepublica.pe",
  },
  {
    id: "4",
    title: "Carlos Alvarez sube 3 puntos en encuestas del sur del pais",
    source: "Gestion",
    time: "Hace 6h",
    category: "politica",
    candidateMentioned: "Carlos Alvarez",
    url: "https://gestion.pe",
  },
  {
    id: "5",
    title: "Ministro de Economia presenta informe sobre crecimiento del PBI al 3.2%",
    source: "Andina",
    time: "Hace 8h",
    category: "economia",
    factCheck: "verified",
    url: "https://andina.pe",
  },
  {
    id: "6",
    title: "Claim viral sobre candidato desmentido por el JNE",
    source: "Ojo Publico",
    time: "Hace 10h",
    category: "social",
    factCheck: "false",
    url: "https://ojo-publico.com",
  },
];

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

export function NewsTicker() {
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
          href="/noticias"
          className="text-xs font-medium text-primary hover:text-indigo-glow transition-colors"
        >
          Ver todas →
        </a>
      </div>

      <div className="divide-y divide-border">
        {mockNews.map((news, index) => (
          <motion.a
            key={news.id}
            href={news.url || "/noticias"}
            target={news.url ? "_blank" : undefined}
            rel={news.url ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {news.title}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {news.source}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {news.time}
                </span>
                {news.candidateMentioned && (
                  <Badge
                    variant="secondary"
                    className="h-5 text-[10px] px-1.5"
                  >
                    {news.candidateMentioned}
                  </Badge>
                )}
              </div>
            </div>

            {news.factCheck && (
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

            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
