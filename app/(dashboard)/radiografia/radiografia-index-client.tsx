"use client";

import { motion } from "framer-motion";
import {
  Scan,
  Shield,
  AlertTriangle,
  Eye,
  User,
  ChevronRight,
  Activity,
  Fingerprint,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Candidate } from "@/lib/data/candidates";
import { getRadiografia, RISK_COLORS } from "@/lib/data/radiografia";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RadiografiaIndexClientProps {
  candidates: Candidate[];
}

export default function RadiografiaIndexClient({ candidates }: RadiografiaIndexClientProps) {
  const candidatesWithData = candidates
    .map((c) => ({
      candidate: c,
      radiografia: getRadiografia(c.id),
    }))
    .filter((c) => c.radiografia !== null)
    .sort((a, b) => (b.radiografia?.riskScore || 0) - (a.radiografia?.riskScore || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="classification-header text-center">
          // CONDOR INTELLIGENCE SYSTEM — MODULO RADIOGRAFIA — ACCESO AUTORIZADO //
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Radiografía de Candidatos
          </h1>
          <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
            <Fingerprint className="h-3 w-3" />
            X-RAY
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Análisis profundo de patrimonio, historial legal, redes de contactos y financiamiento de campaña
        </p>
      </motion.div>

      {/* Disclaimer — honest about simulated data */}
      <div className="flex items-start gap-3 rounded-xl border border-amber/20 bg-amber/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Datos de demostración
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            La información mostrada es <span className="font-semibold text-amber">simulada con fines ilustrativos</span>.
            Los montos de patrimonio, procesos legales y puntajes de riesgo no son reales.
            Cuando CONDOR acceda a las declaraciones juradas del JNE y registros oficiales,
            esta sección se actualizará con datos verificados.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {candidatesWithData.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Candidatos Analizados</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-rose">
            {candidatesWithData.filter((c) => (c.radiografia?.riskScore || 0) >= 60).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Alto Riesgo</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-emerald">
            {candidatesWithData.filter((c) => (c.radiografia?.riskScore || 0) < 35).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Bajo Riesgo</p>
        </div>
      </div>

      {/* Candidates grid */}
      <div className="space-y-3">
        {candidatesWithData.map(({ candidate, radiografia }, index) => {
          if (!radiografia) return null;

          const riskColor =
            radiografia.riskScore >= 60
              ? "text-rose"
              : radiografia.riskScore >= 35
                ? "text-amber"
                : "text-emerald";

          const riskBg =
            radiografia.riskScore >= 60
              ? "bg-rose/10"
              : radiografia.riskScore >= 35
                ? "bg-amber/10"
                : "bg-emerald/10";

          const riskLabel =
            radiografia.riskScore >= 60
              ? "ALTO"
              : radiografia.riskScore >= 35
                ? "MEDIO"
                : "BAJO";

          const activeProcs = radiografia.legalHistory.filter(
            (l) => l.status === "activo" || l.status === "investigación"
          ).length;

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/radiografia/${candidate.id}`}>
                <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: candidate.partyColor }}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Risk score circle */}
                      <div className={cn(
                        "relative flex h-16 w-16 items-center justify-center rounded-full border-2 flex-shrink-0",
                        riskBg,
                        radiografia.riskScore >= 60
                          ? "border-rose/40"
                          : radiografia.riskScore >= 35
                            ? "border-amber/40"
                            : "border-emerald/40"
                      )}>
                        <div className="text-center">
                          <p className={cn("font-mono text-xl font-bold tabular-nums", riskColor)}>
                            {radiografia.riskScore}
                          </p>
                        </div>
                        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="2" />
                          <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" className={riskColor} strokeWidth="2" strokeDasharray={`${(radiografia.riskScore / 100) * 188} 188`} strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Candidate info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {candidate.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn("text-[9px] font-mono flex-shrink-0", riskColor,
                              radiografia.riskScore >= 60
                                ? "border-rose/20"
                                : radiografia.riskScore >= 35
                                  ? "border-amber/20"
                                  : "border-emerald/20"
                            )}
                          >
                            {riskLabel}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{candidate.party}</p>

                        {/* Quick indicators */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {radiografia.legalHistory.length} proc.
                          </span>
                          {activeProcs > 0 && (
                            <span className="flex items-center gap-1 text-rose">
                              <AlertTriangle className="h-3 w-3" />
                              {activeProcs} activos
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {radiografia.network.length} vinculos
                          </span>
                          {radiografia.conflictsOfInterest.length > 0 && (
                            <span className="flex items-center gap-1 text-amber">
                              <AlertTriangle className="h-3 w-3" />
                              {radiografia.conflictsOfInterest.length} conflictos
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="classification-header text-center">
        // FIN DEL INDICE — {candidatesWithData.length} PERFILES DISPONIBLES //
      </div>
    </div>
  );
}
