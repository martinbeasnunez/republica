"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, Radio, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  time: string;
  text: string;
  source: string;
}

interface LiveTimelineProps {
  entries: TimelineItem[];
}

const sourceConfig: Record<string, { color: string; url: string }> = {
  // 🇵🇪 Perú
  "RPP": { color: "bg-blue-500", url: "https://rpp.pe" },
  "El Comercio": { color: "bg-stone-800", url: "https://elcomercio.pe" },
  "El Comercio Perú": { color: "bg-stone-800", url: "https://elcomercio.pe" },
  "Infobae": { color: "bg-green-600", url: "https://www.infobae.com" },
  "Gestión": { color: "bg-red-600", url: "https://gestion.pe" },
  "Gestion": { color: "bg-red-600", url: "https://gestion.pe" },
  "TVPerú": { color: "bg-red-700", url: "https://www.tvperu.gob.pe" },
  "Correo": { color: "bg-orange-500", url: "https://diariocorreo.pe" },
  "La República": { color: "bg-rose-600", url: "https://larepublica.pe" },
  "Agencia Peruana de Noticias | ANDINA": { color: "bg-sky-600", url: "https://andina.pe" },
  // 🇨🇴 Colombia
  "El Tiempo": { color: "bg-blue-700", url: "https://www.eltiempo.com" },
  "El Espectador": { color: "bg-amber-600", url: "https://www.elespectador.com" },
  "Semana": { color: "bg-red-700", url: "https://www.semana.com" },
  "Revista Semana": { color: "bg-red-700", url: "https://www.semana.com" },
  "La Silla Vacía": { color: "bg-stone-700", url: "https://www.lasillavacia.com" },
  "Caracol Radio": { color: "bg-blue-600", url: "https://caracol.com.co" },
  "RCN Radio": { color: "bg-red-600", url: "https://www.rcnradio.com" },
  "Blu Radio": { color: "bg-sky-700", url: "https://www.bluradio.com" },
  "La FM": { color: "bg-red-500", url: "https://www.lafm.com.co" },
  "Razón Pública": { color: "bg-emerald-700", url: "https://razonpublica.com" },
  "El Colombiano": { color: "bg-stone-800", url: "https://www.elcolombiano.com" },
  "Publimetro Colombia": { color: "bg-rose-500", url: "https://www.publimetro.co" },
  "France 24": { color: "bg-blue-800", url: "https://www.france24.com/es" },
  "Colombiacheck": { color: "bg-emerald-600", url: "https://colombiacheck.com" },
};

function decodeEntities(text: string): string {
  return text
    .replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é").replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó").replace(/&uacute;/gi, "ú").replace(/&ntilde;/gi, "ñ")
    .replace(/&iquest;/gi, "¿").replace(/&iexcl;/gi, "¡").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export function LiveTimeline({ entries }: LiveTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth < 640); }, []);
  const displayCount = expanded ? entries.length : isMobile ? 3 : 5;
  const visible = entries.slice(0, displayCount);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-rose" />
          <span className="text-sm font-bold text-foreground">Resumen en vivo</span>
          <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-dot" />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {entries.length} bloques
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[29px] top-0 bottom-0 w-px bg-border" />

        <div className="py-2">
          <AnimatePresence initial={false}>
            {visible.map((entry, index) => (
              <motion.div
                key={`${entry.time}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={cn(
                  "relative flex items-start gap-3 px-5 py-2.5",
                  index === 0 && "bg-primary/[0.02]"
                )}
              >
                {/* Time dot */}
                <div className="flex-shrink-0 relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "h-2.5 w-2.5 rounded-full border-2 border-background",
                    index === 0 ? "bg-rose" : "bg-muted-foreground/30"
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 -mt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                      "font-mono text-[11px] tabular-nums font-bold",
                      index === 0 ? "text-rose" : "text-muted-foreground"
                    )}>
                      {entry.time}
                    </span>
                    <a
                      href={sourceConfig[entry.source]?.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white hover:opacity-80 transition-opacity",
                        sourceConfig[entry.source]?.color || "bg-muted-foreground"
                      )}
                    >
                      {entry.source}
                    </a>
                  </div>
                  <p className={cn(
                    "text-xs leading-snug",
                    index === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {decodeEntities(entry.text)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Expand button */}
      {entries.length > (isMobile ? 3 : 5) && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-primary hover:bg-accent/50 transition-colors border-t border-border"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Ver más ({entries.length - (isMobile ? 3 : 5)} anteriores)
        </button>
      )}

      {/* Footer */}
      <div className="px-5 py-2 border-t border-border/50 bg-muted/20">
        <p className="text-[9px] text-muted-foreground/50 font-mono">
          Resumido por CONDOR AI de medios en vivo · se actualiza cada 15 min
        </p>
      </div>
    </div>
  );
}
