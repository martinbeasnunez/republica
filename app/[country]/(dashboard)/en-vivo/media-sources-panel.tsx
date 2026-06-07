"use client";

import { motion } from "framer-motion";
import { Newspaper, Globe, Radio, ShieldCheck, Building2, ExternalLink } from "lucide-react";
import { useCountry } from "@/lib/config/country-context";

const typeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  newspaper: { icon: <Newspaper className="h-3.5 w-3.5" />, label: "Periódicos" },
  digital: { icon: <Globe className="h-3.5 w-3.5" />, label: "Digital" },
  tv: { icon: <Radio className="h-3.5 w-3.5" />, label: "TV / Radio" },
  agency: { icon: <Building2 className="h-3.5 w-3.5" />, label: "Agencias" },
  factcheck: { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Fact-checkers" },
};

export function MediaSourcesPanel() {
  const country = useCountry();
  const sources = country.mediaSources || [];
  const electoralBodies = country.electoralBodies || [];

  // Group by type
  const grouped = sources.reduce<Record<string, typeof sources>>((acc, s) => {
    const type = s.type || "digital";
    if (!acc[type]) acc[type] = [];
    acc[type].push(s);
    return acc;
  }, {});

  // Order types
  const typeOrder = ["newspaper", "digital", "tv", "agency", "factcheck"];
  const sortedTypes = typeOrder.filter((t) => grouped[t]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Globe className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Fuentes y Medios</h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Media sources by type */}
        {sortedTypes.map((type) => {
          const config = typeConfig[type] || typeConfig.digital;
          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                {config.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grouped[type].map((source) => (
                  <a
                    key={source.name}
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-colors group"
                  >
                    {source.name}
                    <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {/* Electoral bodies */}
        {electoralBodies.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Organismos Electorales</span>
            </div>
            <div className="space-y-2">
              {electoralBodies.map((body) => (
                <div key={body.acronym} className="flex items-start gap-2">
                  <span className="text-xs font-bold font-mono text-primary flex-shrink-0 w-14">
                    {body.acronym}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-snug">
                    {body.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
