"use client";

import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCountry } from "@/lib/config/country-context";

export function Changelog() {
  const country = useCountry();

  return (
    <div className="border-t border-border/50 pt-4 mt-2">
      <Link
        href={`/${country.code}/actualizaciones`}
        className="flex items-center gap-2 w-full text-left group"
      >
        <Zap className="h-3 w-3 text-primary/60" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          Actualizaciones recientes
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/40 ml-auto group-hover:text-primary transition-colors" />
      </Link>
    </div>
  );
}
