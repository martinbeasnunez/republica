"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface Notification {
  id: number;
  message: string;
  type: "update" | "alert" | "analysis" | "verification";
}

const typeStyles = {
  update: "border-emerald/30",
  alert: "border-amber/30",
  analysis: "border-sky/30",
  verification: "border-primary/30",
};

const typeDotColors = {
  update: "bg-emerald",
  alert: "bg-amber",
  analysis: "bg-sky",
  verification: "bg-primary",
};

const messages: { message: string; type: Notification["type"] }[] = [
  { message: "Lopez Aliaga subio a 13.1% en nueva encuesta CPI — actualizado hace 2 min", type: "alert" },
  { message: "FALSO: \"Las elecciones se adelantan a marzo\" — 4,200 shares en X desmentidos", type: "verification" },
  { message: "Keiko Fujimori presento plan de seguridad con FF.AA. — analisis de viabilidad listo", type: "analysis" },
  { message: "3 fake news sobre el debate presidencial detectadas en la ultima hora", type: "verification" },
  { message: "Nueva encuesta Ipsos: 4 candidatos empatados en 3er lugar con 4% — ver detalle", type: "alert" },
  { message: "Plan economico de Acuna analizado: 67/100 en viabilidad segun CONDOR AI", type: "analysis" },
  { message: "Debate JNE confirmado: 6 fechas entre 23 mar y 1 abr — calendario actualizado", type: "update" },
  { message: "12 declaraciones de candidatos verificadas hoy — 4 resultaron falsas", type: "verification" },
  { message: "Congreso destituyo a Jeri — reacciones de 8 candidatos analizadas por IA", type: "update" },
  { message: "Alerta: Forsyth cayo 2 puntos en region sur segun Datum — tendencia actualizada", type: "alert" },
  { message: "Padron electoral actualizado: 25.3M electores habilitados confirma RENIEC", type: "update" },
  { message: "7 propuestas de candidatos sobre seguridad comparadas — ranking disponible", type: "analysis" },
  { message: "Viral en WhatsApp sobre inhabilitacion de candidato — verificado: FALSO", type: "verification" },
  { message: "Simulador electoral recalculado con data de febrero — nuevas probabilidades", type: "update" },
];

export function AINotificationToast() {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const showNext = useCallback(() => {
    const msg = messages[index % messages.length];
    setCurrent({
      id: Date.now(),
      message: msg.message,
      type: msg.type,
    });
    setDismissed(false);
    setIndex((prev) => prev + 1);
  }, [index]);

  // Initial delay, then cycle
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showNext();
    }, 5000);

    return () => clearTimeout(initialDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!current || dismissed) return;
    const timer = setTimeout(() => {
      setDismissed(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, dismissed]);

  // Show next notification after dismiss
  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => {
      showNext();
    }, 12000);
    return () => clearTimeout(timer);
  }, [dismissed, showNext]);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:max-w-sm pointer-events-none">
      <AnimatePresence mode="wait">
        {current && !dismissed && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`pointer-events-auto rounded-xl border bg-card/95 backdrop-blur-md ${typeStyles[current.type]} p-3 sm:p-4 shadow-2xl shadow-black/50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full pulse-dot ${typeDotColors[current.type]}`} />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-foreground/90">
                    CONDOR AI
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Message */}
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              {current.message}
            </p>

            {/* Timestamp */}
            <p className="text-[9px] font-mono text-muted-foreground/60 mt-1.5 text-right">
              ahora
            </p>

            {/* Progress bar that shrinks over 5 seconds */}
            <motion.div
              className={`h-0.5 rounded-full mt-2 ${typeDotColors[current.type]}/60`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ opacity: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
