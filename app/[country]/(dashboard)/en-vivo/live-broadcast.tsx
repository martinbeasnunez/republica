"use client";

import { motion } from "framer-motion";
import { Tv, Radio, Globe, ExternalLink, Youtube } from "lucide-react";
import { useCountry } from "@/lib/config/country-context";

interface BroadcastLink {
  name: string;
  url: string;
  type: "tv" | "radio" | "web" | "youtube" | "results";
  description: string;
}

export function LiveBroadcast() {
  const country = useCountry();

  // Build broadcast links based on country
  const links: BroadcastLink[] = [];

  if (country.code === "pe") {
    links.push(
      { name: "ONPE — Resultados", url: "https://www.onpe.gob.pe", type: "results", description: "Organismo Nacional de Procesos Electorales" },
      { name: "JNE — Voto Informado", url: "https://votoinformado.jne.gob.pe", type: "web", description: "Información oficial de candidatos" },
      { name: "TV Perú EN VIVO", url: "https://www.tvperu.gob.pe/play", type: "tv", description: "Canal del Estado — cobertura electoral" },
      { name: "RPP EN VIVO", url: "https://rpp.pe/play", type: "radio", description: "Radio y streaming de noticias" },
      { name: "Canal N EN VIVO", url: "https://canaln.pe/noticias/canal-n-en-vivo", type: "tv", description: "Canal de noticias 24 horas" },
      { name: "JNE YouTube", url: "https://www.youtube.com/@JNEPRENSA/streams", type: "youtube", description: "Transmisión oficial del JNE" },
    );
  } else if (country.code === "co") {
    links.push(
      { name: "Registraduría — Resultados", url: "https://www.registraduria.gov.co", type: "results", description: "Resultados oficiales del preconteo" },
      { name: "CNE — Consejo Nacional Electoral", url: "https://www.cne.gov.co", type: "web", description: "Vigilancia y reglamentación electoral" },
      { name: "Caracol TV EN VIVO", url: "https://www.caracoltv.com/envivo", type: "tv", description: "Cobertura electoral del día E" },
      { name: "RCN EN VIVO", url: "https://www.canalrcn.com/senal-en-vivo", type: "tv", description: "Cobertura electoral del día E" },
      { name: "Caracol Radio", url: "https://caracol.com.co/programa/en-vivo/", type: "radio", description: "Cobertura radial nacional" },
      { name: "Blu Radio", url: "https://www.bluradio.com/play", type: "radio", description: "Cobertura radial nacional" },
      { name: "Señal Colombia", url: "https://www.senalcolombia.tv/senal-en-vivo", type: "tv", description: "Canal público — cobertura electoral" },
      { name: "MOE — Observación Electoral", url: "https://www.moe.org.co", type: "web", description: "Reportes ciudadanos e irregularidades" },
    );
  }

  if (links.length === 0) return null;

  const typeIcons = {
    tv: <Tv className="h-4 w-4" />,
    radio: <Radio className="h-4 w-4" />,
    web: <Globe className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
    results: <Globe className="h-4 w-4" />,
  };

  const typeColors = {
    tv: "border-blue-200 bg-blue-50/50 hover:bg-blue-50",
    radio: "border-amber-200 bg-amber-50/50 hover:bg-amber-50",
    web: "border-border bg-card hover:bg-accent/50",
    youtube: "border-red-200 bg-red-50/50 hover:bg-red-50",
    results: "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50",
  };

  // Separate results link (featured) from others
  const resultsLink = links.find((l) => l.type === "results");
  const otherLinks = links.filter((l) => l.type !== "results");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Featured: Results link */}
      {resultsLink && (
        <a
          href={resultsLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border-2 border-emerald-300/50 bg-gradient-to-r from-emerald-50 to-emerald-50/30 px-5 py-4 transition-all hover:border-emerald-400/70 hover:shadow-md"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-900 group-hover:text-emerald-700">{resultsLink.name}</p>
            <p className="text-xs text-emerald-700/70">{resultsLink.description}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-emerald-500 group-hover:text-emerald-700 transition-colors" />
        </a>
      )}

      {/* Other broadcast links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {otherLinks.map((link, i) => (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${typeColors[link.type]}`}
          >
            <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
              {typeIcons[link.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{link.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
