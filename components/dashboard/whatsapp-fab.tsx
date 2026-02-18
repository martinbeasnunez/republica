"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "51999999999";

export function WhatsAppFAB() {
  const [expanded, setExpanded] = useState(false);

  const message = encodeURIComponent(
    "Hola! Quiero recibir actualizaciones sobre las elecciones Peru 2026 de REPUBLICA."
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-64 rounded-xl border border-border bg-card p-4 shadow-xl"
          >
            <p className="text-sm font-semibold text-foreground mb-1">
              Recibe alertas electorales
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Conecta con nuestro agente de WhatsApp para mantenerte informado.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Abrir WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          expanded
            ? "bg-muted text-foreground"
            : "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
        )}
      >
        {expanded ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </button>
    </div>
  );
}
