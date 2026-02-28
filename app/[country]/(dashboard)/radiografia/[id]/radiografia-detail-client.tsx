"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  Fingerprint,
  Scan,
  GraduationCap,
  Briefcase,
  Scale,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Candidate } from "@/lib/data/candidates";
import { type CandidateProfile } from "@/lib/data/profiles";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

type Section = "trayectoria" | "controversias" | "legal" | "partidos";

const SECTIONS: {
  id: Section;
  label: string;
  icon: typeof Shield;
  color: string;
}[] = [
  {
    id: "trayectoria",
    label: "TRAYECTORIA",
    icon: Briefcase,
    color: "text-primary",
  },
  {
    id: "controversias",
    label: "CONTROVERSIAS",
    icon: AlertTriangle,
    color: "text-amber",
  },
  {
    id: "legal",
    label: "SITUACION LEGAL",
    icon: Scale,
    color: "text-rose",
  },
  {
    id: "partidos",
    label: "HISTORIAL PARTIDARIO",
    icon: GitBranch,
    color: "text-sky",
  },
];

interface RadiografiaDetailClientProps {
  candidate: Candidate;
  profile: CandidateProfile | null;
}

export default function RadiografiaDetailClient({
  candidate,
  profile,
}: RadiografiaDetailClientProps) {
  const country = useCountry();
  const [activeSection, setActiveSection] = useState<Section>("trayectoria");
  const [expandedControversy, setExpandedControversy] = useState<number | null>(
    null
  );

  const hasProfile = profile !== null;

  const confidenceLabel = !hasProfile
    ? "EN INVESTIGACION"
    : profile.confidence >= 0.7
      ? "PERFIL VERIFICADO"
      : "PERFIL BASICO";

  const confidenceColor = !hasProfile
    ? "text-amber"
    : profile.confidence >= 0.7
      ? "text-emerald"
      : "text-sky";

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href={`/${country.code}/radiografia`}>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a radiografias
        </Button>
      </Link>

      {/* CLASSIFIED HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="classification-header text-center">
          // CONDOR — PERFIL VERIFICABLE — FUENTES PUBLICAS //
        </div>
      </motion.div>

      {/* Hero: Candidate Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-card border-border overflow-hidden">
          <div
            className="h-1.5 w-full"
            style={{
              backgroundColor: candidate.partyColor,
              opacity: 0.8,
            }}
          />
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Profile photo */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted/30 overflow-hidden">
                  {candidate.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <Scan className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <Badge
                  className={cn(
                    "text-[9px] font-mono tracking-wider",
                    confidenceColor,
                    !hasProfile
                      ? "bg-amber/10 border-amber/20"
                      : profile.confidence >= 0.7
                        ? "bg-emerald/10 border-emerald/20"
                        : "bg-sky/10 border-sky/20"
                  )}
                  variant="outline"
                >
                  {hasProfile ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {confidenceLabel}
                </Badge>
              </div>

              {/* Candidate info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Scan className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[10px] text-primary tracking-widest uppercase">
                    Perfil Verificable
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {candidate.name}
                </h1>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: candidate.partyColor }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {candidate.party}
                    </span>
                  </div>
                </div>

                {/* Quick stats grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      Anos en politica
                    </p>
                    <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                      {profile?.yearsInPolitics ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      Candidaturas
                    </p>
                    <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                      {profile?.previousCandidacies ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      Controversias
                    </p>
                    <p
                      className={cn(
                        "font-mono text-xl font-bold tabular-nums",
                        (profile?.controversies?.length ?? 0) > 0
                          ? "text-amber"
                          : "text-foreground"
                      )}
                    >
                      {profile?.controversies?.length ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      Partidos
                    </p>
                    <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                      {profile?.partyHistory?.length ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* No profile notice */}
      {!hasProfile && (
        <div className="flex items-start gap-3 rounded-xl border border-amber/20 bg-amber/5 p-4">
          <Clock className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Perfil en investigacion
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              El perfil de este candidato se esta compilando automaticamente.
              Estara disponible pronto con informacion verificable de fuentes
              publicas.
            </p>
          </div>
        </div>
      )}

      {/* Biography */}
      {hasProfile && profile.biography && (
        <Card className="bg-card border-border overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Biografia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {profile.biography}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Section Navigation */}
      {hasProfile && (
        <>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-mono tracking-wider transition-all whitespace-nowrap",
                      isActive
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* TRAYECTORIA SECTION */}
              {activeSection === "trayectoria" && (
                <div className="space-y-4">
                  <div className="classification-header">
                    // SECCION 1: TRAYECTORIA — EDUCACION Y CARRERA POLITICA //
                  </div>

                  {/* Education */}
                  {profile.education.length > 0 && (
                    <Card className="bg-card border-border overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <GraduationCap className="h-3.5 w-3.5 text-primary" />
                          Educacion
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {profile.education.map((edu, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 rounded-lg bg-muted/20 border border-border/50 p-3"
                            >
                              <GraduationCap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-foreground">
                                  {edu.degree}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {edu.institution}
                                  {edu.year ? ` (${edu.year})` : ""}
                                </p>
                              </div>
                              {edu.verified && (
                                <CheckCircle2 className="h-4 w-4 text-emerald flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Career Timeline */}
                  {profile.career.length > 0 && (
                    <Card className="bg-card border-border overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-sky via-sky/50 to-transparent" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-sky" />
                          Carrera Politica y Profesional
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />
                          <div className="space-y-4">
                            {profile.career
                              .sort(
                                (a, b) =>
                                  (b.startYear ?? 0) - (a.startYear ?? 0)
                              )
                              .map((entry, i) => (
                                <div
                                  key={i}
                                  className="relative flex gap-4 pl-0"
                                >
                                  <div className="flex flex-col items-center z-10">
                                    <div
                                      className={cn(
                                        "h-9 w-9 rounded-full border-2 flex items-center justify-center",
                                        i === 0
                                          ? "bg-primary/10 border-primary/40"
                                          : "bg-muted border-border"
                                      )}
                                    >
                                      <span className="font-mono text-[10px] text-foreground">
                                        {entry.startYear}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 pb-1">
                                    <p className="text-xs font-medium text-foreground">
                                      {entry.role}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {entry.entity}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                      {entry.startYear}
                                      {entry.endYear
                                        ? ` — ${entry.endYear}`
                                        : " — presente"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {profile.education.length === 0 &&
                    profile.career.length === 0 && (
                      <Card className="bg-card border-border">
                        <CardContent className="p-8 text-center">
                          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground font-medium">
                            Informacion en proceso de recopilacion
                          </p>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}

              {/* CONTROVERSIAS SECTION */}
              {activeSection === "controversias" && (
                <div className="space-y-4">
                  <div className="classification-header">
                    // SECCION 2: CONTROVERSIAS — EVENTOS REPORTADOS EN PRENSA
                    //
                  </div>

                  {profile.controversies.length > 0 ? (
                    <div className="space-y-3">
                      {profile.controversies.map((cont, i) => {
                        const isExpanded = expandedControversy === i;
                        const severityColors = {
                          alta: {
                            text: "text-rose",
                            bg: "bg-rose/10",
                            border: "border-rose/20",
                          },
                          media: {
                            text: "text-amber",
                            bg: "bg-amber/10",
                            border: "border-amber/20",
                          },
                          baja: {
                            text: "text-sky",
                            bg: "bg-sky/10",
                            border: "border-sky/20",
                          },
                        };
                        const colors =
                          severityColors[cont.severity] ??
                          severityColors.media;

                        return (
                          <Card
                            key={i}
                            className={cn(
                              "bg-card border-border overflow-hidden transition-all cursor-pointer",
                              cont.severity === "alta" && "border-rose/20",
                              isExpanded && "ring-1 ring-primary/30"
                            )}
                            onClick={() =>
                              setExpandedControversy(isExpanded ? null : i)
                            }
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
                                    colors.bg
                                  )}
                                >
                                  <AlertTriangle
                                    className={cn("h-5 w-5", colors.text)}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-medium text-foreground">
                                      {cont.title}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[9px] font-mono",
                                        colors.text,
                                        colors.border
                                      )}
                                    >
                                      {cont.severity.toUpperCase()}
                                    </Badge>
                                    {cont.date && (
                                      <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                                        {cont.date}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">
                                    {cont.summary}
                                  </p>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{
                                          opacity: 1,
                                          height: "auto",
                                        }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pt-3 border-t border-border/50"
                                      >
                                        <p className="text-xs text-foreground leading-relaxed">
                                          {cont.summary}
                                        </p>

                                        {cont.sources &&
                                          cont.sources.length > 0 && (
                                            <div className="mt-3">
                                              <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">
                                                Fuentes
                                              </p>
                                              <div className="space-y-1">
                                                {cont.sources.map(
                                                  (src, j) => (
                                                    <p
                                                      key={j}
                                                      className="text-[11px] text-primary flex items-center gap-1"
                                                    >
                                                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                      {src}
                                                    </p>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    {isExpanded
                                      ? "Menos detalles"
                                      : "Ver detalles"}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-8 text-center">
                        <Shield className="h-8 w-8 text-emerald mx-auto mb-2" />
                        <p className="text-sm text-emerald font-medium">
                          Sin controversias documentadas
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          No se encontraron controversias reportadas en las
                          fuentes consultadas
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* SITUACION LEGAL SECTION */}
              {activeSection === "legal" && (
                <div className="space-y-4">
                  <div className="classification-header">
                    // SECCION 3: SITUACION LEGAL — INFORMACION PUBLICA //
                  </div>

                  <Card className="bg-card border-border overflow-hidden">
                    <div className="h-0.5 w-full bg-gradient-to-r from-rose via-rose/50 to-transparent" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Scale className="h-3.5 w-3.5 text-rose" />
                        Resumen Legal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {profile.legalSummary ||
                          "Sin procesos legales de conocimiento publico."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3">
                    <Fingerprint className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground">
                      La informacion legal se basa en noticias y documentos
                      publicos. No constituye una investigacion judicial ni
                      reemplaza la consulta de antecedentes oficiales.
                    </p>
                  </div>
                </div>
              )}

              {/* HISTORIAL PARTIDARIO SECTION */}
              {activeSection === "partidos" && (
                <div className="space-y-4">
                  <div className="classification-header">
                    // SECCION 4: HISTORIAL PARTIDARIO — AFILIACIONES Y
                    CANDIDATURAS //
                  </div>

                  {profile.partyHistory.length > 0 ? (
                    <Card className="bg-card border-border overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-sky via-sky/50 to-transparent" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <GitBranch className="h-3.5 w-3.5 text-sky" />
                          Historial de Partidos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />
                          <div className="space-y-4">
                            {profile.partyHistory
                              .sort(
                                (a, b) =>
                                  (b.startYear ?? 0) - (a.startYear ?? 0)
                              )
                              .map((ph, i) => (
                                <div
                                  key={i}
                                  className="relative flex gap-4 pl-0"
                                >
                                  <div className="flex flex-col items-center z-10">
                                    <div
                                      className={cn(
                                        "h-9 w-9 rounded-full border-2 flex items-center justify-center",
                                        i === 0
                                          ? "bg-sky/10 border-sky/40"
                                          : "bg-muted border-border"
                                      )}
                                    >
                                      <span className="font-mono text-[10px] text-foreground">
                                        {ph.startYear}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 pb-1">
                                    <p className="text-xs font-medium text-foreground">
                                      {ph.party}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                      {ph.startYear}
                                      {ph.endYear
                                        ? ` — ${ph.endYear}`
                                        : " — presente"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-8 text-center">
                        <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">
                          Sin historial partidario registrado
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Previous candidacies */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                          Candidaturas previas
                        </p>
                        <p className="font-mono text-2xl font-bold tabular-nums text-foreground mt-1">
                          {profile.previousCandidacies}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                          Cambios de partido
                        </p>
                        <p
                          className={cn(
                            "font-mono text-2xl font-bold tabular-nums mt-1",
                            profile.partyHistory.length > 2
                              ? "text-amber"
                              : "text-foreground"
                          )}
                        >
                          {Math.max(0, profile.partyHistory.length - 1)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sources */}
          {profile.sources && profile.sources.length > 0 && (
            <Card className="bg-card border-border overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-muted-foreground/30 via-muted-foreground/10 to-transparent" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Fuentes ({profile.sources.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {profile.sources.slice(0, 10).map((src, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-[11px] text-muted-foreground truncate">
                        {src.title}
                        {src.date ? ` (${src.date})` : ""}
                      </p>
                    </div>
                  ))}
                  {profile.sources.length > 10 && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      + {profile.sources.length - 10} fuentes mas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last updated */}
          {profile.lastResearchedAt && (
            <div className="text-center text-[10px] text-muted-foreground font-mono">
              Ultimo analisis:{" "}
              {new Date(profile.lastResearchedAt).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
        </>
      )}

      {/* Bottom classification */}
      <div className="classification-header text-center">
        // FIN DEL PERFIL — DATOS BASADOS EN FUENTES PUBLICAS //
      </div>
    </div>
  );
}
