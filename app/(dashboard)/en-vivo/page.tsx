"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Radio,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getTopCandidates } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function EnVivoPage() {
  const topCandidates = getTopCandidates(6);
  const [actasProcessed, setActasProcessed] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // Simulated progress
  useEffect(() => {
    // In production, this would be SSE from ONPE
    const timer = setInterval(() => {
      setActasProcessed((prev) => Math.min(prev + 0.1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated vote counts (would be real-time from ONPE)
  const liveResults = topCandidates.map((c, i) => ({
    ...c,
    votes: 0,
    percentage: 0,
    actasWon: 0,
  }));

  const electionDate = new Date("2026-04-12T08:00:00-05:00");
  const now = new Date();
  const isElectionDay = now >= electionDate;

  const gaugeOption = {
    backgroundColor: "transparent",
    series: [
      {
        type: "gauge" as const,
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: "100%",
        center: ["50%", "75%"],
        progress: {
          show: true,
          width: 18,
          itemStyle: { color: "#8B1A1A" },
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: { width: 18, color: [[1, "#1e1c2e"]] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: "bold",
          color: "#f1f5f9",
          formatter: "{value}%",
          offsetCenter: [0, "-15%"],
        },
        data: [{ value: actasProcessed }],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-rose" />
            <h1 className="text-2xl font-bold text-foreground">En Vivo</h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-rose/10 border border-rose/20 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
            <span className="text-[11px] font-bold text-rose">
              {isElectionDay ? "TRANSMISION EN VIVO" : "PROXIMAMENTE"}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Resultados electorales en tiempo real — Elecciones Peru 2026
        </p>
      </motion.div>

      {!isElectionDay ? (
        /* Pre-election state */
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              La transmision en vivo comenzara el dia de la eleccion
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              El 12 de abril de 2026, este dashboard mostrara los resultados
              oficiales de la ONPE en tiempo real con actualizaciones cada 5
              minutos.
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              {(() => {
                const diff = electionDate.getTime() - now.getTime();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                  (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                  (diff % (1000 * 60 * 60)) / (1000 * 60)
                );

                return (
                  <>
                    <div className="text-center">
                      <p className="font-mono text-2xl sm:text-4xl font-bold tabular-nums text-gradient">
                        {days}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                        Dias
                      </p>
                    </div>
                    <span className="text-xl sm:text-2xl text-muted-foreground">:</span>
                    <div className="text-center">
                      <p className="font-mono text-2xl sm:text-4xl font-bold tabular-nums text-gradient">
                        {hours}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                        Horas
                      </p>
                    </div>
                    <span className="text-xl sm:text-2xl text-muted-foreground">:</span>
                    <div className="text-center">
                      <p className="font-mono text-2xl sm:text-4xl font-bold tabular-nums text-gradient">
                        {minutes}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                        Minutos
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Preview of what it will look like */}
            <div className="mt-12">
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                Vista previa del dashboard en vivo
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 opacity-50">
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">
                    Resultados en tiempo real
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Conteo de votos por candidato
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">
                    Mapa en vivo
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Resultados por departamento
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">
                    Proyecciones
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Con modelo estadistico
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Election day - live results */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main results */}
          <div className="space-y-6 lg:col-span-2">
            {/* Actas processed gauge */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Actas Procesadas
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs">
                    <RefreshCw className="h-3 w-3" />
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ReactECharts
                  option={gaugeOption}
                  style={{ height: 200 }}
                  opts={{ renderer: "canvas" }}
                />
              </CardContent>
            </Card>

            {/* Live vote bars */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm">
                  Resultados Parciales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveResults.map((r) => (
                  <div key={r.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: r.partyColor }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {r.shortName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {r.votes.toLocaleString()} votos
                        </span>
                        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                          {r.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          backgroundColor: r.partyColor,
                          width: `${r.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Actas procesadas</span>
                  <span className="font-mono tabular-nums">0 / 86,488</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Votos contados</span>
                  <span className="font-mono tabular-nums">0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ultima actualizacion</span>
                  <span className="text-xs">Esperando datos...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
