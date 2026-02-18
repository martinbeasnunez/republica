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

const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "Congreso destituye a Jose Jeri tras 130 dias como presidente del Peru",
    source: "Infobae",
    time: "17 Feb",
    category: "politica",
    factCheck: "verified",
    url: "https://www.infobae.com/peru/2026/02/17/jose-jeri-fue-destituido-como-y-cuando-se-elegira-al-nuevo-presidente-de-peru-y-quienes-son-los-principales-candidatos/",
  },
  {
    id: "2",
    title: "JNE sorteara este viernes las seis fechas para el debate presidencial",
    source: "Andina",
    time: "17 Feb",
    category: "politica",
    factCheck: "verified",
    url: "https://andina.pe/agencia/noticia-elecciones-2026-jne-sorteara-este-viernes-20-las-seis-fechas-para-debate-presidencial-1063248.aspx",
  },
  {
    id: "3",
    title: "Encuesta Ipsos: Lopez Aliaga lidera con 12%, cuatro candidatos empatados en tercer lugar",
    source: "Infobae",
    time: "12 Feb",
    category: "politica",
    candidateMentioned: "Lopez Aliaga",
    factCheck: "verified",
    url: "https://www.infobae.com/peru/2026/02/12/asi-van-las-encuestas-a-solo-dos-meses-de-las-elecciones-2026-cuatro-candidatos-empatados-en-el-tercer-lugar/",
  },
  {
    id: "4",
    title: "Lopez Aliaga: las 15 controversiales propuestas para ganar votos",
    source: "La Republica",
    time: "8 Feb",
    category: "politica",
    candidateMentioned: "Lopez Aliaga",
    url: "https://larepublica.pe/politica/2026/02/08/lopez-aliaga-las-15-controversiales-propuestas-para-llamar-atencion-y-ganar-votos-elecciones-2026-hnews-267416",
  },
  {
    id: "5",
    title: "Keiko Fujimori plantea que Fuerzas Armadas controlen carceles y fronteras",
    source: "Andina",
    time: "6 Feb",
    category: "seguridad",
    candidateMentioned: "K. Fujimori",
    factCheck: "verified",
    url: "https://andina.pe/agencia/noticia-elecciones-2026-keiko-fujimori-plantea-fuerzas-armadas-controlen-carceles-y-fronteras-1062965.aspx",
  },
  {
    id: "6",
    title: "Lopez Aliaga tendra como prioridades seguridad, alimentacion y agua",
    source: "Andina",
    time: "5 Feb",
    category: "politica",
    candidateMentioned: "Lopez Aliaga",
    factCheck: "verified",
    url: "https://andina.pe/agencia/noticia-elecciones-2026-lopez-aliaga-tendra-como-prioridades-seguridad-alimentacion-y-agua-1062495.aspx",
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
        {newsItems.map((news, index) => {
          const content = (
            <>
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

              {news.url && (
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5" />
              )}
            </>
          );

          return news.url ? (
            <motion.a
              key={news.id}
              href={news.url}
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
