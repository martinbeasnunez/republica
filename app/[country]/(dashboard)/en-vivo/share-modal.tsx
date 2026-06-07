"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, MessageCircle } from "lucide-react";
import { useCountry } from "@/lib/config/country-context";

// =============================================================================
// Share Modal — appears 60s after the user lands on the page.
// Encourages them to share the live pulse with friends on WhatsApp during the
// election day. Once dismissed, we don't bug them again in the session.
// =============================================================================

const DISMISS_KEY = "condor:share-modal-dismissed";
const SHOW_AFTER_MS = 60_000;

export function ShareModal() {
  const country = useCountry();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skip if already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const url = `https://www.condorlatam.com/${country.code}`;
  const text = `Estoy siguiendo las elecciones de Colombia en vivo con CONDOR AI 🇨🇴\nCada 5 minutos un resumen de lo que está pasando.\n${url}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;

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
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#FCD116]/30 bg-gradient-to-br from-[#001a4d] via-[#003893] to-[#001a4d] shadow-2xl"
          >
            {/* tricolor glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#FCD116]/20 blur-3xl" />
              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#CE1126]/20 blur-3xl" />
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
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-[#FCD116]/30 px-3 py-1">
                <Share2 className="h-3 w-3 text-[#FCD116]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Avisale a un parcero
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                ¿Te está sirviendo el Pulso en vivo?
              </h2>

              <p className="text-sm text-white/80 leading-relaxed">
                CONDOR AI te resume cada 5 minutos lo que está pasando en las elecciones de Colombia. Compartilo con quien también esté pendiente hoy.
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
