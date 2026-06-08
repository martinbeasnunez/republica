"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, MessageCircle } from "lucide-react";
import { useCountry } from "@/lib/config/country-context";
import type { CountryCode } from "@/lib/config/countries";

// =============================================================================
// Share Modal — appears 60s after the user lands on the page.
// Encourages them to share the live pulse with friends on WhatsApp during the
// election day. Once dismissed, we don't bug them again in the session.
//
// Per-country copy + palette so the modal never feels foreign to the user.
// =============================================================================

const DISMISS_KEY = "condor:share-modal-dismissed";
const SHOW_AFTER_MS = 60_000;

interface CountryShareTheme {
  // Palette
  gradient: string;
  borderAccent: string;
  glowA: string;
  glowB: string;
  accentHex: string;
  pillBorder: string;
  // Copy
  eyebrow: string;        // pill at top — short, local slang welcome
  headline: string;       // big question
  body: string;           // paragraph below the headline
  shareText: (url: string) => string; // WhatsApp message body
}

// Brand voice: "profesional con calidez". Tuteo neutral, sin slang generacional
// ("pata"/"parcero") ni voseo. Combina con el tono editorial del resto del
// producto (radiografía, planes, comparador).
const COUNTRY_SHARE: Record<CountryCode, CountryShareTheme> = {
  pe: {
    // 🇵🇪 Rojo peruano (#8B1A1A) sobre stone-950
    gradient: "bg-gradient-to-br from-stone-950 via-red-950 to-stone-900",
    borderAccent: "border-red-400/30",
    glowA: "rgba(232,64,64,0.22)",
    glowB: "rgba(255,255,255,0.08)",
    accentHex: "#E84040",
    pillBorder: "border-red-400/40",
    eyebrow: "Comparte el conteo en vivo",
    headline: "¿Te está sirviendo esta cobertura?",
    body: "CONDOR AI resume cada 5 minutos el balotaje Fujimori vs Sánchez con conteo oficial ONPE. Comparte con alguien que también esté siguiendo la segunda vuelta hoy.",
    shareText: (url) =>
      `Estoy siguiendo el balotaje Perú 2026 en vivo con CONDOR AI 🇵🇪 — conteo oficial ONPE y resumen cada 5 minutos.\n${url}`,
  },
  co: {
    // 🇨🇴 Azul (#003893) + amarillo (#FCD116) + rojo (#CE1126) bandera
    gradient: "bg-gradient-to-br from-[#001a4d] via-[#003893] to-[#001a4d]",
    borderAccent: "border-[#FCD116]/30",
    glowA: "rgba(252,209,22,0.22)",
    glowB: "rgba(206,17,38,0.22)",
    accentHex: "#FCD116",
    pillBorder: "border-[#FCD116]/40",
    eyebrow: "Comparte el pulso en vivo",
    headline: "¿Te está sirviendo esta cobertura?",
    body: "CONDOR AI resume cada 5 minutos lo que está pasando en las elecciones de Colombia con preconteo oficial de la Registraduría. Comparte con alguien que también esté siguiendo la jornada hoy.",
    shareText: (url) =>
      `Estoy siguiendo las elecciones de Colombia en vivo con CONDOR AI 🇨🇴 — preconteo Registraduría y resumen cada 5 minutos.\n${url}`,
  },
};

export function ShareModal() {
  const country = useCountry();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const theme = COUNTRY_SHARE[country.code] ?? COUNTRY_SHARE.co;
  const url = `https://www.condorlatam.com/${country.code}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(theme.shareText(url))}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-8 sm:pb-0"
          onClick={dismiss}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border ${theme.borderAccent} ${theme.gradient} shadow-2xl`}
          >
            {/* country-themed glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: theme.glowA }} />
              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: theme.glowB }} />
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-10 rounded-full bg-white/10 hover:bg-white/20 p-1.5 text-white/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="relative px-6 py-7 space-y-4 text-center">
              <div className={`inline-flex items-center gap-2 rounded-full bg-white/10 border ${theme.pillBorder} px-3 py-1`}>
                <Share2 className="h-3 w-3" style={{ color: theme.accentHex }} />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  {theme.eyebrow}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {theme.headline}
              </h2>

              <p className="text-sm text-white/80 leading-relaxed">
                {theme.body}
              </p>

              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-sm px-6 py-3 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Compartir por WhatsApp
              </a>

              <button
                type="button"
                onClick={dismiss}
                className="text-[11px] text-white/50 hover:text-white/80 font-mono"
              >
                Ahora no
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
