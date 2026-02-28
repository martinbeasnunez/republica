"use client";

import { motion } from "framer-motion";
import {
  Scan,
  Shield,
  AlertTriangle,
  ChevronRight,
  Fingerprint,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Candidate } from "@/lib/data/candidates";
import { type CandidateProfile } from "@/lib/data/profiles";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

interface RadiografiaIndexClientProps {
  candidates: Candidate[];
  profiles: CandidateProfile[];
}

export default function RadiografiaIndexClient({
  candidates,
  profiles,
}: RadiografiaIndexClientProps) {
  const country = useCountry();

  // Build map of profiles by candidateId
  const profileMap = new Map(profiles.map((p) => [p.candidateId, p]));

  // Merge candidates with their profiles (candidates are already filtered to active by the DB query)
  const candidatesWithProfile = candidates
    .map((c) => ({
      candidate: c,
      profile: profileMap.get(c.id) ?? null,
    }));

  const withProfile = candidatesWithProfile.filter((c) => c.profile !== null);
  const withoutProfile = candidatesWithProfile.filter(
    (c) => c.profile === null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="classification-header text-center">
          // CONDOR — PERFILES VERIFICABLES — FUENTES PUBLICAS //
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Radiografia de Candidatos
          </h1>
          <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
            <Fingerprint className="h-3 w-3" />
            PERFILES
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Trayectoria, controversias documentadas y situacion legal de cada
          candidato. Toda la informacion proviene de fuentes publicas
          verificables.
        </p>
      </motion.div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Informacion verificable
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Los perfiles se compilan automaticamente a partir de noticias y
            fuentes publicas. Cada dato incluye sus fuentes para que puedas
            verificarlo. Los perfiles se actualizan semanalmente.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {candidatesWithProfile.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Candidatos
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-emerald">
            {withProfile.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Perfiles Investigados
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-amber">
            {withoutProfile.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            En Investigacion
          </p>
        </div>
      </div>

      {/* Candidates grid */}
      <div className="space-y-3">
        {candidatesWithProfile.map((entry, index) => {
          const { candidate, profile } = entry;
          const hasProfile = profile !== null;
          const controversyCount = profile?.controversies?.length ?? 0;
          const careerCount = profile?.career?.length ?? 0;

          const confidenceLabel =
            !profile
              ? "EN INVESTIGACION"
              : profile.confidence >= 0.7
                ? "PERFIL VERIFICADO"
                : "PERFIL BASICO";

          const confidenceColor =
            !profile
              ? "text-amber"
              : profile.confidence >= 0.7
                ? "text-emerald"
                : "text-sky";

          const confidenceBorder =
            !profile
              ? "border-amber/20"
              : profile.confidence >= 0.7
                ? "border-emerald/20"
                : "border-sky/20";

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/${country.code}/radiografia/${candidate.id}`}>
                <Card
                  className={cn(
                    "bg-card border-border hover:border-primary/30 transition-all cursor-pointer group overflow-hidden",
                    !hasProfile && "opacity-70"
                  )}
                >
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: candidate.partyColor }}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Profile photo or placeholder */}
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-muted/30 flex-shrink-0 overflow-hidden">
                        {candidate.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <Scan className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Candidate info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {candidate.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-mono flex-shrink-0",
                              confidenceColor,
                              confidenceBorder
                            )}
                          >
                            {hasProfile ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {confidenceLabel}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {candidate.party}
                        </p>

                        {/* Quick indicators */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-mono">
                          {hasProfile ? (
                            <>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {profile.yearsInPolitics} anos en politica
                              </span>
                              {careerCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {careerCount} cargos
                                </span>
                              )}
                              {controversyCount > 0 && (
                                <span className="flex items-center gap-1 text-amber">
                                  <AlertTriangle className="h-3 w-3" />
                                  {controversyCount} controversias
                                </span>
                              )}
                              {profile.previousCandidacies > 0 && (
                                <span className="flex items-center gap-1">
                                  <Fingerprint className="h-3 w-3" />
                                  {profile.previousCandidacies} candidaturas
                                  previas
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-amber">
                              <Clock className="h-3 w-3" />
                              Perfil en proceso de investigacion
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
        // FIN DEL INDICE — {candidatesWithProfile.length} CANDIDATOS //
      </div>
    </div>
  );
}
