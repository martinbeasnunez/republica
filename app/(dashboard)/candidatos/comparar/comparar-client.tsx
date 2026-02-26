"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, User, Scale, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IDEOLOGY_LABELS,
  CATEGORIES_LABELS,
  type Candidate,
} from "@/lib/data/candidates";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CompararClientProps {
  candidates: Candidate[];
}

export function CompararClient({ candidates }: CompararClientProps) {
  const [selected, setSelected] = useState<Candidate[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const addCandidate = (candidate: Candidate) => {
    if (selected.length < 4 && !selected.find((c) => c.id === candidate.id)) {
      setSelected([...selected, candidate]);
    }
    setShowPicker(false);
  };

  const removeCandidate = (id: string) => {
    setSelected(selected.filter((c) => c.id !== id));
  };

  const allTopics = selected.length > 0
    ? Object.keys(selected[0].quizPositions)
    : [];

  const allCategories = [
    ...new Set(
      selected.flatMap((c) => c.keyProposals.map((p) => p.category))
    ),
  ];

  return (
    <div className="space-y-6">
      <Link href="/candidatos">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Comparar Candidatos
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecciona hasta 4 candidatos para comparar lado a lado
        </p>
      </div>

      {/* Selected candidates */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {selected.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl border border-border bg-card p-4"
          >
            <button
              onClick={() => removeCandidate(candidate.id)}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white text-xs"
            >
              <X className="h-3 w-3" />
            </button>
            <div
              className="h-1 w-full rounded-full mb-3"
              style={{ backgroundColor: candidate.partyColor }}
            />
            <div
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full overflow-hidden"
              style={{ backgroundColor: candidate.partyColor + "20" }}
            >
              {candidate.photo && candidate.photo.startsWith("http") ? (
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" style={{ color: candidate.partyColor }} />
              )}
            </div>
            <p className="text-center text-sm font-semibold text-foreground truncate">
              {candidate.shortName}
            </p>
            <p className="text-center text-[11px] text-muted-foreground truncate">
              {candidate.party}
            </p>
            <p className="text-center font-mono text-lg font-bold tabular-nums text-foreground mt-1">
              {candidate.pollAverage.toFixed(1)}%
            </p>
          </motion.div>
        ))}

        {selected.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex h-full min-h-[160px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 transition-colors hover:border-primary/30 hover:bg-card"
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
              <span className="mt-2 text-xs text-muted-foreground">
                Agregar candidato
              </span>
            </button>

            {showPicker && (
              <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[200px] sm:w-64 rounded-xl border border-border bg-card p-2 shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                {candidates
                  .filter((c) => !selected.find((s) => s.id === c.id))
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addCandidate(c)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.partyColor }}
                      />
                      <span className="flex-1 text-foreground">
                        {c.shortName}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {c.pollAverage.toFixed(1)}%
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected.length >= 2 && (
        <>
          {/* Comparison: Key Info */}
          <Card className="bg-card border-border overflow-x-auto">
            <CardHeader>
              <CardTitle className="text-sm">Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left text-xs font-medium text-muted-foreground w-24 sm:w-32">
                      Dato
                    </th>
                    {selected.map((c) => (
                      <th
                        key={c.id}
                        className="py-2 text-center text-xs font-medium"
                        style={{ color: c.partyColor }}
                      >
                        {c.shortName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      label: "Partido",
                      getValue: (c: Candidate) => c.party,
                    },
                    {
                      label: "Ideología",
                      getValue: (c: Candidate) =>
                        IDEOLOGY_LABELS[c.ideology].es,
                    },
                    {
                      label: "Edad",
                      getValue: (c: Candidate) => `${c.age} años`,
                    },
                    {
                      label: "Profesión",
                      getValue: (c: Candidate) => c.profession,
                    },
                    {
                      label: "Región",
                      getValue: (c: Candidate) => c.region,
                    },
                    {
                      label: "Encuesta",
                      getValue: (c: Candidate) =>
                        `${c.pollAverage.toFixed(1)}%`,
                    },
                    {
                      label: "Tendencia",
                      getValue: (c: Candidate) =>
                        c.pollTrend === "up"
                          ? "↑ Subiendo"
                          : c.pollTrend === "down"
                            ? "↓ Bajando"
                            : "→ Estable",
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-2 text-xs text-muted-foreground">
                        {row.label}
                      </td>
                      {selected.map((c) => (
                        <td
                          key={c.id}
                          className="py-2 text-center text-xs text-foreground"
                        >
                          {row.getValue(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Comparison: Political Positions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Posiciones Políticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allTopics.map((topic) => (
                <div key={topic}>
                  <p className="text-xs font-medium text-foreground capitalize mb-2">
                    {topic.replace(/-/g, " ")}
                  </p>
                  <div className="space-y-1.5">
                    {selected.map((c) => {
                      const position = c.quizPositions[topic] ?? 0;
                      return (
                        <div key={c.id} className="flex items-center gap-2">
                          <span
                            className="text-[10px] w-20 truncate"
                            style={{ color: c.partyColor }}
                          >
                            {c.shortName}
                          </span>
                          <div className="relative flex-1 h-2 rounded-full bg-muted">
                            <div
                              className="absolute h-4 w-4 rounded-full top-1/2 -translate-y-1/2 border-2 border-card"
                              style={{
                                left: `${((position + 2) / 4) * 100}%`,
                                backgroundColor: c.partyColor,
                                transform: `translateX(-50%) translateY(-50%)`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">
                      En contra
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      A favor
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comparison: Key Proposals */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Propuestas Clave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {selected.map((c) => (
                  <div key={c.id} className="space-y-3">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: c.partyColor }}
                    >
                      {c.shortName}
                    </p>
                    {c.keyProposals.map((p, i) => (
                      <div key={i} className="rounded-lg bg-muted/50 p-3">
                        <Badge variant="secondary" className="text-[9px] mb-1">
                          {CATEGORIES_LABELS[p.category].es}
                        </Badge>
                        <p className="text-xs font-medium text-foreground">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {p.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selected.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Scale className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Selecciona al menos 2 candidatos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            para ver la comparación detallada
          </p>
        </div>
      )}
    </div>
  );
}
