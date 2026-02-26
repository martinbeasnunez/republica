"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ExternalLink,
  User,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type FactCheck } from "@/lib/data/fact-checks";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";

type Verdict = "VERDADERO" | "PARCIALMENTE_VERDADERO" | "ENGANOSO" | "FALSO" | "NO_VERIFICABLE";

const verdictConfig: Record<
  Verdict,
  { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }
> = {
  VERDADERO: {
    label: "Verdadero",
    icon: CheckCircle2,
    color: "text-emerald",
    bg: "bg-emerald/10",
    border: "border-emerald/20",
  },
  PARCIALMENTE_VERDADERO: {
    label: "Parcialmente verdadero",
    icon: HelpCircle,
    color: "text-sky",
    bg: "bg-sky/10",
    border: "border-sky/20",
  },
  NO_VERIFICABLE: {
    label: "No verificable",
    icon: HelpCircle,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
  },
  ENGANOSO: {
    label: "Engañoso",
    icon: AlertTriangle,
    color: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/20",
  },
  FALSO: {
    label: "Falso",
    icon: XCircle,
    color: "text-rose",
    bg: "bg-rose/10",
    border: "border-rose/20",
  },
};

interface VerificadorClientProps {
  initialChecks: FactCheck[];
  initialStats: {
    total: number;
    falsas: number;
    verdaderas: number;
    parciales: number;
  };
}

export default function VerificadorClient({ initialChecks, initialStats }: VerificadorClientProps) {
  const [query, setQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<FactCheck[]>(initialChecks);
  const [error, setError] = useState<string | null>(null);

  const stats = {
    total: initialStats.total + results.length - initialChecks.length,
    falsas: initialStats.falsas + results.filter((r) => r.verdict === "FALSO" && !initialChecks.find((ic) => ic.id === r.id)).length,
    verdaderas: initialStats.verdaderas + results.filter((r) => r.verdict === "VERDADERO" && !initialChecks.find((ic) => ic.id === r.id)).length,
    parciales: initialStats.parciales + results.filter((r) => (r.verdict === "PARCIALMENTE_VERDADERO" || r.verdict === "ENGANOSO") && !initialChecks.find((ic) => ic.id === r.id)).length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isChecking) return;

    setIsChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al verificar");
      }

      const newResult: FactCheck = {
        id: data.data.id || `fc-${Date.now()}`,
        claim: query,
        verdict: data.data.verdict,
        explanation: data.data.explanation,
        sources: data.data.sources || [],
        sourceUrls: data.data.source_urls || [],
        confidence: data.data.confidence || 0,
        context: data.data.context || "",
        claimant: data.data.claimant || "Desconocido",
        claimOrigin: data.data.claim_origin || "",
        createdAt: data.data.timestamp,
      };

      setResults((prev) => [newResult, ...prev]);
      setQuery("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al conectar con la IA. Intenta de nuevo."
      );
    } finally {
      setIsChecking(false);
    }
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Verificador de Hechos
          </h1>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Sparkles className="h-3 w-3" />
            IA avanzada
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Verifica cualquier afirmación electoral con inteligencia artificial en
          tiempo real
        </p>
      </motion.div>

      {/* Fact-check input */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1" />
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Verifica una afirmación
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder='Escribe la afirmación a verificar...'
                  className="pl-10 bg-background border-border h-12"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={!query.trim() || isChecking}
                className="h-12 px-6 gap-2 flex-shrink-0"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Verificar
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Usa modelos de IA de última generación. Cruza información con fuentes oficiales
              (JNE, ONPE, RENIEC) y medios verificados.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-rose/20 bg-rose/5 p-3"
          >
            <p className="text-sm text-rose flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Verificaciones", value: stats.total, color: "text-indigo" },
          { label: "Falsas", value: stats.falsas, color: "text-rose" },
          { label: "Verdaderas", value: stats.verdaderas, color: "text-emerald" },
          { label: "Parciales", value: stats.parciales, color: "text-amber" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${stat.color}`}
            >
              {stat.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <WhatsAppCTA context="verificador" />

      {/* Results list */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {results.length > 0 ? "Verificaciones recientes" : "Sin verificaciones aún"}
        </h2>

        {results.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Escribe una afirmación arriba para empezar a verificar
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Cada verificación queda guardada para la comunidad
            </p>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {results.map((fc, index) => {
              const config = verdictConfig[fc.verdict];
              if (!config) return null;
              const Icon = config.icon;

              return (
                <motion.div
                  key={fc.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                >
                  <Card className="bg-card border-border hover:border-primary/20 transition-all group">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Verdict indicator */}
                        <div
                          className={cn(
                            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                            config.bg
                          )}
                        >
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Claim */}
                          <p className="text-sm font-medium text-foreground">
                            &ldquo;{fc.claim}&rdquo;
                          </p>

                          {/* Verdict badge + confidence */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <div
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                                config.color,
                                config.bg,
                                config.border
                              )}
                            >
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </div>
                            {fc.confidence > 0 && (
                              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                                {Math.round(fc.confidence * 100)}% confianza
                              </span>
                            )}
                          </div>

                          {/* Explanation */}
                          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                            {fc.explanation}
                          </p>

                          {/* Context */}
                          {fc.context && (
                            <p className="mt-1 text-[11px] text-muted-foreground/70 italic">
                              {fc.context}
                            </p>
                          )}

                          {/* Attribution: claimant + origin */}
                          {(fc.claimant || fc.claimOrigin) && (
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                              {fc.claimant && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <User className="h-3 w-3 flex-shrink-0" />
                                  <span className="font-medium text-foreground/80">{fc.claimant}</span>
                                </span>
                              )}
                              {fc.claimOrigin && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  {fc.claimOrigin}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Sources + meta */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              Fuentes:
                            </span>
                            {fc.sources.map((source, idx) => {
                              const url = fc.sourceUrls?.[idx];
                              return url ? (
                                <a
                                  key={source}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors"
                                >
                                  {source}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ) : (
                                <Badge
                                  key={source}
                                  variant="outline"
                                  className="text-[10px] h-5"
                                >
                                  {source}
                                </Badge>
                              );
                            })}
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                              <Clock className="h-3 w-3" />
                              {timeAgo(fc.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
