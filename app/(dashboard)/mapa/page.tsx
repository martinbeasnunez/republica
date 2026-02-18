"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Info, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { candidates } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";

// Peru departments with mock leading candidate data
const departments = [
  { name: "Amazonas", leading: "C. Alvarez", color: "#0369a1", percentage: 18.2 },
  { name: "Ancash", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 15.1 },
  { name: "Apurimac", leading: "A. Humala", color: "#b91c1c", percentage: 22.3 },
  { name: "Arequipa", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 19.5 },
  { name: "Ayacucho", leading: "A. Humala", color: "#b91c1c", percentage: 20.1 },
  { name: "Cajamarca", leading: "C. Alvarez", color: "#0369a1", percentage: 16.8 },
  { name: "Callao", leading: "K. Fujimori", color: "#ff6600", percentage: 14.2 },
  { name: "Cusco", leading: "De la Torre", color: "#16a34a", percentage: 17.6 },
  { name: "Huancavelica", leading: "A. Humala", color: "#b91c1c", percentage: 21.0 },
  { name: "Huanuco", leading: "C. Alvarez", color: "#0369a1", percentage: 15.9 },
  { name: "Ica", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 16.3 },
  { name: "Junin", leading: "C. Alvarez", color: "#0369a1", percentage: 14.7 },
  { name: "La Libertad", leading: "K. Fujimori", color: "#ff6600", percentage: 17.8 },
  { name: "Lambayeque", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 15.5 },
  { name: "Lima", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 13.8 },
  { name: "Loreto", leading: "C. Alvarez", color: "#0369a1", percentage: 16.2 },
  { name: "Madre de Dios", leading: "Forsyth", color: "#ea580c", percentage: 14.1 },
  { name: "Moquegua", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 17.2 },
  { name: "Pasco", leading: "A. Humala", color: "#b91c1c", percentage: 18.5 },
  { name: "Piura", leading: "K. Fujimori", color: "#ff6600", percentage: 16.0 },
  { name: "Puno", leading: "A. Humala", color: "#b91c1c", percentage: 25.3 },
  { name: "San Martin", leading: "C. Alvarez", color: "#0369a1", percentage: 15.4 },
  { name: "Tacna", leading: "Lopez Aliaga", color: "#1e3a8a", percentage: 18.0 },
  { name: "Tumbes", leading: "Forsyth", color: "#ea580c", percentage: 13.9 },
  { name: "Ucayali", leading: "C. Alvarez", color: "#0369a1", percentage: 14.8 },
];

const legendItems = [
  { name: "Lopez Aliaga (RP)", color: "#1e3a8a" },
  { name: "K. Fujimori (FP)", color: "#ff6600" },
  { name: "C. Alvarez (FP)", color: "#0369a1" },
  { name: "A. Humala (UPP)", color: "#b91c1c" },
  { name: "Forsyth (SP)", color: "#ea580c" },
  { name: "De la Torre (AP)", color: "#16a34a" },
];

export default function MapaPage() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const selectedData = departments.find(
    (d) => d.name === (selectedDept || hoveredDept)
  );

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
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Candidato lider por departamento segun promedio de encuestas regionales
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map placeholder + department grid */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Peru — 25 Departamentos
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Datos de encuestas regionales
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Interactive department grid (visual map placeholder) */}
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
                {departments.map((dept) => (
                  <motion.button
                    key={dept.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setSelectedDept(
                        selectedDept === dept.name ? null : dept.name
                      )
                    }
                    onMouseEnter={() => setHoveredDept(dept.name)}
                    onMouseLeave={() => setHoveredDept(null)}
                    className={cn(
                      "relative rounded-lg p-2 text-center transition-all duration-200 border",
                      selectedDept === dept.name
                        ? "ring-2 ring-primary border-primary"
                        : "border-transparent hover:border-border"
                    )}
                    style={{
                      backgroundColor: dept.color + "25",
                    }}
                  >
                    <div
                      className="h-1 w-full rounded-full mb-1.5"
                      style={{ backgroundColor: dept.color }}
                    />
                    <p className="text-[9px] font-medium text-foreground truncate">
                      {dept.name}
                    </p>
                    <p
                      className="font-mono text-[10px] font-bold tabular-nums"
                      style={{ color: dept.color }}
                    >
                      {dept.percentage}%
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                {legendItems.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Selected department info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">
                {selectedData
                  ? selectedData.name
                  : "Selecciona un departamento"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Candidato lider
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: selectedData.color }}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {selectedData.leading}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Intencion de voto
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                      {selectedData.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: selectedData.color }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(selectedData.percentage / 30) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Haz clic en un departamento para ver el detalle
                </p>
              )}
            </CardContent>
          </Card>

          {/* Department ranking */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Top Departamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...departments]
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 8)
                .map((dept, i) => (
                  <button
                    key={dept.name}
                    onClick={() => setSelectedDept(dept.name)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground w-4">
                      {i + 1}
                    </span>
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="flex-1 text-xs text-foreground">
                      {dept.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dept.leading}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums">
                      {dept.percentage}%
                    </span>
                  </button>
                ))}
            </CardContent>
          </Card>

          {/* Note */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              Mapa interactivo con MapLibre GL disponible proximamente. Los
              datos mostrados son del promedio de encuestas regionales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
