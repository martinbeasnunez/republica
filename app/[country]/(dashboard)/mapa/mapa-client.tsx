"use client";

import { motion } from "framer-motion";
import { Map, MapPin, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Candidate } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

interface MapaClientProps {
  candidates: Candidate[];
}

export default function MapaClient({ candidates }: MapaClientProps) {
  const country = useCountry();
  const departments = country.departments.map(d => d.name);

  // Top candidates by national poll average
  const topCandidates = [...candidates]
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Mapa Electoral
          </h1>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock className="h-3 w-3" />
            Próximamente
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Intención de voto por departamento — disponible cuando existan encuestas regionales
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main area — coming soon map */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {country.name} — {departments.length} Departamentos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Department grid — showing departments without fake data */}
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
                {departments.map((dept, i) => (
                  <motion.div
                    key={dept}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-lg p-2 text-center border border-border/50 bg-muted/20"
                  >
                    <p className="text-[9px] font-medium text-foreground truncate">
                      {dept}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground/50 tabular-nums mt-0.5">
                      —
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Notice */}
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber/5 border border-amber/20 p-3">
                <AlertTriangle className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Sin datos regionales disponibles
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Aún no existen encuestas regionales publicadas para las elecciones 2026.
                    Cuando las encuestadoras publiquen datos por departamento, este mapa se
                    actualizará automáticamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side panel — national snapshot */}
        <div className="space-y-4">
          {/* National poll snapshot */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Encuesta Nacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topCandidates.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                >
                  <span className="font-mono text-[10px] text-muted-foreground w-4">
                    {i + 1}
                  </span>
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.partyColor }}
                  />
                  <span className="flex-1 text-xs text-foreground truncate">
                    {c.shortName}
                  </span>
                  <span
                    className="font-mono text-xs font-bold tabular-nums"
                    style={{ color: c.partyColor }}
                  >
                    {c.pollAverage.toFixed(1)}%
                  </span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground/60 pt-2 border-t border-border mt-2">
                Promedio de encuestas nacionales
              </p>
            </CardContent>
          </Card>

          {/* What will this show */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Cuando esté disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Candidato líder por departamento
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Mapa interactivo con colores por partido
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Detalle al seleccionar cada departamento
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Comparación urbano vs rural
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
