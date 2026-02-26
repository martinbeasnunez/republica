"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChangelogEntry {
  date: string;
  items: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: "23 feb",
    items: [
      "SEO optimizado: sitemap dinámico, metadata por página y datos estructurados",
      "Encuestas actualizadas al 22 de febrero",
      "Actualización automática de encuestas dos veces por semana",
      "Comparador de planes: nueva experiencia de selección de candidatos",
      "Mejor contraste en gráficos de cobertura de propuestas",
    ],
  },
  {
    date: "22 feb",
    items: [
      "IA más inteligente al leer encuestas: detecta titulares falsos",
      "Verificación automática de noticias diaria",
      "Datos de encuestas corregidos y validados",
    ],
  },
  {
    date: "19 feb",
    items: [
      "Verificador conectado a noticias reales",
      "La IA verifica noticias automáticamente",
      "Verificaciones con variedad: verdadero, falso, engañoso",
      "Historial de cambios en el sidebar",
    ],
  },
  {
    date: "18 feb",
    items: [
      "Toda la plataforma ahora usa datos reales",
      "Mapa electoral: próximamente con datos regionales",
      "Radiografía con aviso de datos preliminares",
    ],
  },
  {
    date: "17 feb",
    items: [
      "Briefing del Día rediseñado: noticias, carrera y radar",
      "Más fuentes y medios reconocidos",
      "Noticias muestran hace cuánto se publicaron",
    ],
  },
  {
    date: "16 feb",
    items: [
      "Alertas de WhatsApp rediseñadas",
      "Navegación reorganizada",
      "Herramientas más accesibles al entrar",
    ],
  },
];

export function Changelog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border/50 pt-4 mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <Zap className="h-3 w-3 text-primary/60" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          Actualizaciones recientes
        </span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground/40 ml-auto" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground/40 ml-auto" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
              {CHANGELOG.map((entry) => (
                <div key={entry.date}>
                  <p className="text-[9px] font-mono font-bold text-primary/50 uppercase tracking-wider mb-1">
                    {entry.date}
                  </p>
                  <ul className="space-y-0.5">
                    {entry.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-[10px] text-muted-foreground/50 leading-relaxed flex gap-1.5"
                      >
                        <span className="text-primary/30 flex-shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
