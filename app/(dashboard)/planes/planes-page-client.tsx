"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, BarChart3, ArrowRight, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Candidate } from "@/lib/data/candidates";
import { PlanesClient } from "./planes-client";
import { CompararPlanesClient } from "./comparar/comparar-planes-client";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";

interface PlanesPageClientProps {
  candidates: Candidate[];
}

export function PlanesPageClient({ candidates }: PlanesPageClientProps) {
  const [tab, setTab] = useState("planes");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Planes de Gobierno
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Explora y compara los planes de gobierno de cada candidato
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start bg-card border border-border">
          <TabsTrigger value="planes" className="gap-2">
            <FileText className="h-3.5 w-3.5" />
            Propuestas
          </TabsTrigger>
          <TabsTrigger
            value="comparar"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Comparar candidatos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planes" className="mt-4 space-y-4">
          {/* Comparar CTA banner */}
          <motion.button
            onClick={() => setTab("comparar")}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-4 sm:p-5 text-left transition-all hover:border-primary/50 hover:from-primary/8 group"
          >
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Compara planes lado a lado
                  </p>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-medium text-primary">
                    NUEVO
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecciona hasta 4 candidatos y compara sus propuestas por categoría
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-primary flex-shrink-0">
                <span className="text-xs font-medium hidden sm:inline">Comparar</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.button>

          <PlanesClient candidates={candidates} />
        </TabsContent>

        <TabsContent value="comparar" className="mt-4">
          <CompararPlanesClient candidates={candidates} />
        </TabsContent>
      </Tabs>

      <WhatsAppCTA context="planes" />
    </div>
  );
}
