"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { IDEOLOGY_LABELS, type Ideology, type Candidate } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ideologies: Ideology[] = [
  "izquierda",
  "centro-izquierda",
  "centro",
  "centro-derecha",
  "derecha",
];

export function CandidatosClient({ candidates }: { candidates: Candidate[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdeology, setSelectedIdeology] = useState<Ideology | null>(null);
  const [sortBy, setSortBy] = useState<"poll" | "name" | "party">("poll");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.party.toLowerCase().includes(query) ||
          c.profession.toLowerCase().includes(query)
      );
    }

    if (selectedIdeology) {
      result = result.filter((c) => c.ideology === selectedIdeology);
    }

    switch (sortBy) {
      case "poll":
        result.sort((a, b) => b.pollAverage - a.pollAverage);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "party":
        result.sort((a, b) => a.party.localeCompare(b.party));
        break;
    }

    return result;
  }, [candidates, searchQuery, selectedIdeology, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidatos</h1>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidatos presidenciales habilitados para 2026
          </p>
        </div>
        <Link href="/candidatos/comparar">
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Comparar
          </Button>
        </Link>
      </motion.div>

      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, partido o profesión..."
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["poll", "name", "party"] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy(sort)}
              className="text-xs"
            >
              {sort === "poll"
                ? "Encuestas"
                : sort === "name"
                  ? "Nombre"
                  : "Partido"}
            </Button>
          ))}
        </div>
      </div>

      {/* Ideology filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Ideología:</span>
        <Badge
          variant={selectedIdeology === null ? "default" : "secondary"}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedIdeology(null)}
        >
          Todos
        </Badge>
        {ideologies.map((ideology) => (
          <Badge
            key={ideology}
            variant={selectedIdeology === ideology ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() =>
              setSelectedIdeology(
                selectedIdeology === ideology ? null : ideology
              )
            }
          >
            {IDEOLOGY_LABELS[ideology].es}
          </Badge>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filteredCandidates.length} candidato
        {filteredCandidates.length !== 1 ? "s" : ""} encontrado
        {filteredCandidates.length !== 1 ? "s" : ""}
      </p>

      {/* Candidates grid */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col gap-3"
        )}
      >
        {filteredCandidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            index={index}
            rank={sortBy === "poll" ? index + 1 : undefined}
          />
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No se encontraron candidatos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Intenta con otros filtros o términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
