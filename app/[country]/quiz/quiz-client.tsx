"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Share2,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  CircleCheck,
  CircleMinus,
  CircleX,
  Copy,
  Check,
  Sparkles,
  Trophy,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Candidate } from "@/lib/data/candidates";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { useCountry } from "@/lib/config/country-context";
import { getCountryConfig } from "@/lib/config/countries";

interface CountryCtx {
  code: string;
  name: string;
  capital: string;
}

type QText = string | ((ctx: CountryCtx) => string);

interface QuizQuestion {
  id: string;
  question: QText;
  description: QText;
  topic: string;
}

const questions: QuizQuestion[] = [
  {
    id: "pena-muerte",
    question: "¿Estás a favor de la pena de muerte para delitos graves?",
    description: ({ code }) =>
      code === "co"
        ? "La Constitución colombiana la prohíbe. Requeriría reforma constitucional."
        : "Como violación, sicariato y terrorismo.",
    topic: "Seguridad",
  },
  {
    id: "estado-empresario",
    question: "¿El Estado debe tener un rol más activo en la economía?",
    description: "Incluyendo empresas públicas y regulación de precios.",
    topic: "Economía",
  },
  {
    id: "inversion-extranjera",
    question: ({ name }) => `¿Se debe promover más la inversión extranjera en ${name}?`,
    description: "Con incentivos fiscales y facilidades regulatorias.",
    topic: "Economía",
  },
  {
    id: "mineria",
    question: ({ code }) =>
      code === "co"
        ? "¿La minería y la extracción de petróleo deben expandirse para impulsar la economía?"
        : "¿La minería debe expandirse para impulsar la economía?",
    description: "Incluso en zonas sensibles ambientalmente.",
    topic: "Medio Ambiente",
  },
  {
    id: "aborto",
    question: ({ code }) =>
      code === "co"
        ? "¿Estás a favor de mantener el derecho al aborto como está actualmente?"
        : "¿Estás a favor de despenalizar el aborto en más causales?",
    description: ({ code }) =>
      code === "co"
        ? "Desde 2022, el aborto es legal hasta la semana 24 de gestación por fallo de la Corte Constitucional."
        : "Actualmente solo es legal por riesgo de vida de la madre.",
    topic: "Derechos",
  },
  {
    id: "matrimonio-igualitario",
    question: ({ code }) =>
      code === "co"
        ? "¿Estás a favor de ampliar los derechos de las parejas del mismo sexo?"
        : "¿Estás a favor del matrimonio entre personas del mismo sexo?",
    description: ({ code }) =>
      code === "co"
        ? "El matrimonio igualitario es legal desde 2016. Incluye derechos de adopción y herencia."
        : "Con los mismos derechos civiles que el matrimonio tradicional.",
    topic: "Derechos",
  },
  {
    id: "descentralizacion",
    question: ({ code }) =>
      code === "co"
        ? "¿Los departamentos deben tener más autonomía y presupuesto?"
        : "¿Las regiones deben tener más autonomía y presupuesto?",
    description: ({ capital }) => `Reduciendo el centralismo de ${capital}.`,
    topic: "Gobernanza",
  },
  {
    id: "educacion-publica",
    question: "¿Se debe aumentar significativamente el presupuesto en educación?",
    description: ({ code }) =>
      code === "co"
        ? "Hasta alcanzar el 6% del PIB como mínimo."
        : "Hasta alcanzar el 6% del PBI como mínimo.",
    topic: "Educación",
  },
  {
    id: "salud-universal",
    question: ({ name }) => `¿Todos los ciudadanos de ${name} deben tener acceso a salud gratuita y de calidad?`,
    description: ({ code }) =>
      code === "co"
        ? "Reformando el sistema de EPS hacia un modelo de salud universal."
        : "A través de un sistema universal de salud.",
    topic: "Salud",
  },
  {
    id: "corrupcion",
    question: "¿Se necesitan penas más severas para los funcionarios corruptos?",
    description: "Incluyendo inhabilitación perpetua y confiscación de bienes.",
    topic: "Anticorrupción",
  },
];

function resolveQuestion(q: QuizQuestion, ctx: CountryCtx) {
  return {
    id: q.id,
    question: typeof q.question === "function" ? q.question(ctx) : q.question,
    description: typeof q.description === "function" ? q.description(ctx) : q.description,
    topic: q.topic,
  };
}

type Answer = -2 | -1 | 0 | 1 | 2;

const answerLabels: Record<Answer, string> = {
  [-2]: "Totalmente en contra",
  [-1]: "En contra",
  [0]: "Neutral",
  [1]: "A favor",
  [2]: "Totalmente a favor",
};

const answerColors: Record<Answer, string> = {
  [-2]: "bg-rose text-white",
  [-1]: "bg-rose/60 text-white",
  [0]: "bg-muted text-foreground",
  [1]: "bg-emerald/60 text-white",
  [2]: "bg-emerald text-white",
};

// ── Topic breakdown helper ──
const positionLabel = (val: number): string => {
  if (val >= 2) return "Totalmente a favor";
  if (val >= 1) return "A favor";
  if (val === 0) return "Neutral";
  if (val >= -1) return "En contra";
  return "Totalmente en contra";
};

interface TopicBreakdown {
  topicId: string;
  topicLabel: string;
  userAnswer: number;
  candidatePosition: number;
  diff: number;
  match: "agree" | "partial" | "disagree";
}

function getTopicBreakdown(
  userAnswers: Record<string, number>,
  candidate: Candidate,
  resolvedQs: { id: string; topic: string }[]
): TopicBreakdown[] {
  return resolvedQs.map((q) => {
    const userAnswer = userAnswers[q.id] ?? 0;
    const candidatePosition = candidate.quizPositions[q.id] ?? 0;
    const diff = Math.abs(userAnswer - candidatePosition);
    return {
      topicId: q.id,
      topicLabel: q.topic,
      userAnswer,
      candidatePosition,
      diff,
      match: diff <= 1 ? "agree" : diff <= 2 ? "partial" : "disagree",
    };
  });
}

function countAgreements(breakdown: TopicBreakdown[]): number {
  return breakdown.filter((t) => t.match === "agree").length;
}

// ── Animated count-up number ──
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1000;
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return <>{display}</>;
}

interface QuizClientProps {
  candidates: Candidate[];
}

export default function QuizClient({ candidates }: QuizClientProps) {
  const country = useCountry();
  const countryName = country.name;
  const capital = country.capital;
  const countryCode = country.code;

  const ctx: CountryCtx = { code: countryCode, name: countryName, capital };
  const resolvedQuestions = useMemo(
    () => questions.map((q) => resolveQuestion(q, ctx)),
    [countryCode, countryName, capital]
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = (Object.keys(answers).length / resolvedQuestions.length) * 100;

  const results = useMemo(() => {
    if (!showResults) return [];

    return candidates
      .map((candidate) => {
        let totalScore = 0;
        let maxScore = 0;

        Object.entries(answers).forEach(([topic, userAnswer]) => {
          const candidatePosition = candidate.quizPositions[topic] ?? 0;
          const diff = Math.abs(userAnswer - candidatePosition);
          const maxDiff = 4; // -2 to +2
          totalScore += maxDiff - diff;
          maxScore += maxDiff;
        });

        const compatibility = maxScore > 0
          ? Math.round((totalScore / maxScore) * 100)
          : 0;

        return { candidate, compatibility };
      })
      .sort((a, b) => b.compatibility - a.compatibility);
  }, [showResults, answers, candidates]);

  const handleAnswer = (answer: Answer) => {
    const question = resolvedQuestions[currentQuestion];
    setAnswers({ ...answers, [question.id]: answer });

    // Auto-advance to next question, but NOT to results on last question
    if (currentQuestion < resolvedQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 200);
    }
    // On the last question, stay — user must tap "Ver resultados" explicitly
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    submittedRef.current = false;
  };

  // ── Submit quiz results to backend ──
  const submittedRef = useRef(false);
  useEffect(() => {
    if (!showResults || results.length === 0 || submittedRef.current) return;
    submittedRef.current = true;

    const top = results[0];
    const sessionId =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("condor_sid") || ""
        : "";
    const visitorId =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("condor_vid") || ""
        : "";
    const fullSessionId = visitorId
      ? `v:${visitorId}|s:${sessionId}`
      : sessionId;

    fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country_code: countryCode,
        answers,
        results: results.map((r) => ({
          candidate_id: r.candidate.id,
          candidate_name: r.candidate.shortName,
          compatibility: r.compatibility,
        })),
        top_candidate_id: top.candidate.id,
        top_candidate_name: top.candidate.shortName,
        top_compatibility: top.compatibility,
        session_id: fullSessionId,
      }),
    }).catch(() => {
      // Silently fail — never break the user experience
    });
  }, [showResults, results, answers, countryCode]);

  // ── Expandable detail state for candidates #2+ ──
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Theme colors for branded results ──
  const countryConfig = getCountryConfig(countryCode);
  const primary = countryConfig?.theme.primary ?? "#8B1A1A";
  const primaryLight = countryConfig?.theme.primaryLight ?? "#A52525";
  const electionYear = countryConfig?.electionDate?.slice(0, 4) ?? "2026";

  // ── Share state ──
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  // ── Reveal animation stages ──
  const [revealStage, setRevealStage] = useState(0);

  useEffect(() => {
    if (!showResults) { setRevealStage(0); return; }
    const timers = [
      setTimeout(() => setRevealStage(1), 100),
      setTimeout(() => setRevealStage(2), 500),
      setTimeout(() => setRevealStage(3), 1200),
      setTimeout(() => setRevealStage(4), 1800),
      setTimeout(() => setRevealStage(5), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showResults]);

  const handleShare = async () => {
    if (!results[0]) return;
    const top = results[0];
    const quizUrl = `https://condorlatam.com/${countryCode}/quiz`;
    const shareText = `Mi candidato #1 es ${top.candidate.shortName} con ${top.compatibility}% de compatibilidad 🗳️ Descubre el tuyo en CONDOR:`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "CONDOR Quiz Electoral", text: shareText, url: quizUrl });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${quizUrl}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      window.prompt("Copia este enlace:", `${shareText}\n${quizUrl}`);
    }
  };

  if (showResults) {
    const top = results[0];
    const runners = results.slice(1, 3);
    const rest = results.slice(3, 8);
    const topBreakdown = top ? getTopicBreakdown(answers, top.candidate, resolvedQuestions) : [];
    const topAgrees = countAgreements(topBreakdown);

    // Ring gauge math
    const ringSize = 180;
    const ringStroke = 6;
    const ringRadius = (ringSize - ringStroke) / 2;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - ((top?.compatibility ?? 0) / 100) * ringCircumference;

    return (
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* ═══════════ ZONA A: SCREENSHOT CARD ═══════════ */}
        <div className="quiz-result-bg rounded-2xl border border-border overflow-hidden glow-indigo">
          {/* Classification header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={revealStage >= 1 ? { opacity: 1 } : {}}
            className="classification-header text-center"
          >
            CONDOR &nbsp;// &nbsp;QUIZ ELECTORAL &nbsp;// &nbsp;{countryName.toUpperCase()} {electionYear} &nbsp;// &nbsp;TUS RESULTADOS
          </motion.div>

          <div className="px-5 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-8">
            {/* CONDOR logo + name */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={revealStage >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-1"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
                style={{ background: `linear-gradient(135deg, ${primary}, ${primaryLight})` }}
              >
                C
              </div>
              <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground">
                CONDOR
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={revealStage >= 1 ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-center text-xs text-muted-foreground mb-6"
            >
              Tu candidato más compatible
            </motion.p>

            {/* ── Hero: Ring gauge + candidate photo ── */}
            {top && (
              <div className="flex flex-col items-center">
                {/* Ring container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={revealStage >= 2 ? { opacity: 1, scale: 1 } : {}}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="relative mb-4"
                  style={{ width: ringSize, height: ringSize }}
                >
                  {/* SVG Ring */}
                  <svg width={ringSize} height={ringSize} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      className="text-muted/20"
                      strokeWidth={ringStroke}
                    />
                    {/* Animated foreground circle */}
                    <motion.circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke={top.candidate.partyColor}
                      strokeWidth={ringStroke}
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      initial={{ strokeDashoffset: ringCircumference }}
                      animate={revealStage >= 2 ? { strokeDashoffset: ringOffset } : {}}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    />
                  </svg>

                  {/* Candidate photo centered in ring */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={revealStage >= 3 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="relative h-24 w-24 overflow-hidden rounded-full border-3"
                      style={{ borderColor: top.candidate.partyColor }}
                    >
                      {top.candidate.photo ? (
                        <Image
                          src={top.candidate.photo}
                          alt={top.candidate.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          priority
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ backgroundColor: top.candidate.partyColor + "20" }}
                        >
                          <User className="h-10 w-10" style={{ color: top.candidate.partyColor }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Compatibility percentage */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={revealStage >= 2 ? { opacity: 1 } : {}}
                  className="text-center mb-1"
                >
                  <span
                    className={cn(
                      "font-mono text-4xl sm:text-5xl font-black tabular-nums",
                      top.compatibility >= 70
                        ? "text-emerald"
                        : top.compatibility >= 50
                          ? "text-amber"
                          : "text-muted-foreground"
                    )}
                  >
                    <AnimatedNumber value={top.compatibility} delay={600} />%
                  </span>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">compatible</p>
                </motion.div>

                {/* Candidate name + party */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={revealStage >= 3 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4 }}
                  className="text-center mt-2"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {top.candidate.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: top.candidate.partyColor + "20",
                        color: top.candidate.partyColor,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: top.candidate.partyColor }}
                      />
                      {top.candidate.party}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Coinciden en <span className="font-semibold text-foreground">{topAgrees} de {resolvedQuestions.length}</span> temas
                  </p>
                </motion.div>
              </div>
            )}

            {/* ── Runners-up: #2 and #3 ── */}
            {runners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={revealStage >= 4 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-2 sm:gap-3 mt-6"
              >
                {runners.map((r, i) => {
                  const rAgrees = countAgreements(getTopicBreakdown(answers, r.candidate, resolvedQuestions));
                  return (
                    <div
                      key={r.candidate.id}
                      className="rounded-xl border border-border bg-card/50 p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold bg-muted text-muted-foreground">
                          {i + 2}
                        </span>
                        <div
                          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2"
                          style={{ borderColor: r.candidate.partyColor }}
                        >
                          {r.candidate.photo ? (
                            <Image
                              src={r.candidate.photo}
                              alt={r.candidate.shortName}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{ backgroundColor: r.candidate.partyColor + "20" }}
                            >
                              <User className="h-4 w-4" style={{ color: r.candidate.partyColor }} />
                            </div>
                          )}
                        </div>
                        <span
                          className={cn(
                            "ml-auto font-mono text-lg font-bold tabular-nums",
                            r.compatibility >= 70
                              ? "text-emerald"
                              : r.compatibility >= 50
                                ? "text-amber"
                                : "text-muted-foreground"
                          )}
                        >
                          {r.compatibility}%
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {r.candidate.shortName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {r.candidate.party} · {rAgrees}/{resolvedQuestions.length} temas
                      </p>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: r.candidate.partyColor }}
                          initial={{ width: 0 }}
                          animate={revealStage >= 4 ? { width: `${r.compatibility}%` } : {}}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* ── Branded footer ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={revealStage >= 4 ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border/50"
            >
              <div
                className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-black text-white"
                style={{ background: `linear-gradient(135deg, ${primary}, ${primaryLight})` }}
              >
                C
              </div>
              <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                condorlatam.com/{countryCode}/quiz
              </span>
            </motion.div>
          </div>

          {/* Bottom gradient accent */}
          <div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${primary}, ${primaryLight}, ${primary}, transparent)`,
            }}
          />
        </div>

        {/* ═══════════ SHARE BUTTON (primary CTA) ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={revealStage >= 5 ? { opacity: 1, y: 0 } : {}}
        >
          <Button
            size="lg"
            onClick={handleShare}
            className="w-full gap-2 text-base font-bold py-6 glow-indigo"
          >
            {shareState === "copied" ? (
              <>
                <Check className="h-5 w-5" />
                Enlace copiado
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" />
                Compartir mis resultados
              </>
            )}
          </Button>
        </motion.div>

        {/* ═══════════ ZONA B: TOPIC BREAKDOWN (#1) ═══════════ */}
        {top && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={revealStage >= 5 ? { opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <p className="text-xs font-semibold text-foreground mb-3">
                  ¿Por qué coincides con {top.candidate.shortName}?
                </p>
                <div className="space-y-1.5">
                  {topBreakdown.map((topic) => (
                    <div key={topic.topicId} className="flex items-center gap-2 text-xs">
                      {topic.match === "agree" ? (
                        <CircleCheck className="h-4 w-4 shrink-0 text-emerald" />
                      ) : topic.match === "partial" ? (
                        <CircleMinus className="h-4 w-4 shrink-0 text-amber" />
                      ) : (
                        <CircleX className="h-4 w-4 shrink-0 text-rose" />
                      )}
                      <span className="font-medium text-foreground w-24 shrink-0">
                        {topic.topicLabel}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {topic.match === "agree"
                          ? `Ambos: ${positionLabel(topic.candidatePosition).toLowerCase()}`
                          : `Tú: ${positionLabel(topic.userAnswer).toLowerCase()} · Candidato: ${positionLabel(topic.candidatePosition).toLowerCase()}`}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/${countryCode}/candidatos/${top.candidate.slug}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Ver perfil completo
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══════════ REMAINING CANDIDATES (#4-#8) ═══════════ */}
        {rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={revealStage >= 5 ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground px-1">Otros candidatos</p>
            {rest.map((result, index) => {
              const breakdown = getTopicBreakdown(answers, result.candidate, resolvedQuestions);
              const agrees = countAgreements(breakdown);
              const isExpanded = expandedId === result.candidate.id;

              return (
                <Card key={result.candidate.id} className="bg-card border-border overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold bg-muted text-muted-foreground">
                        {index + 4}
                      </span>
                      <div
                        className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2"
                        style={{ borderColor: result.candidate.partyColor }}
                      >
                        {result.candidate.photo ? (
                          <Image
                            src={result.candidate.photo}
                            alt={result.candidate.shortName}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center"
                            style={{ backgroundColor: result.candidate.partyColor + "20" }}
                          >
                            <User className="h-4 w-4" style={{ color: result.candidate.partyColor }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {result.candidate.shortName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {result.candidate.party} · {agrees}/{resolvedQuestions.length} temas
                        </p>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-base font-bold tabular-nums shrink-0",
                          result.compatibility >= 70
                            ? "text-emerald"
                            : result.compatibility >= 50
                              ? "text-amber"
                              : "text-muted-foreground"
                        )}
                      >
                        {result.compatibility}%
                      </span>
                    </div>

                    {/* Expandable topic breakdown */}
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === result.candidate.id ? null : result.candidate.id)
                      }
                      className="mt-2 flex w-full items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>Ver detalle</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 mt-2 pt-2 border-t border-border">
                            {breakdown.map((topic) => (
                              <div key={topic.topicId} className="flex items-center gap-2 text-[11px]">
                                {topic.match === "agree" ? (
                                  <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald" />
                                ) : topic.match === "partial" ? (
                                  <CircleMinus className="h-3.5 w-3.5 shrink-0 text-amber" />
                                ) : (
                                  <CircleX className="h-3.5 w-3.5 shrink-0 text-rose" />
                                )}
                                <span className="font-medium text-foreground">{topic.topicLabel}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* ═══════════ ZONA C: ACTIONS ═══════════ */}
        <WhatsAppCTA context="quiz" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={revealStage >= 5 ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-2"
        >
          <Button variant="outline" onClick={reset} className="w-full sm:w-auto gap-2">
            <RotateCcw className="h-4 w-4" />
            Repetir quiz
          </Button>
          {top && (
            <Link href={`/${countryCode}/candidatos/${top.candidate.slug}`} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full gap-2">
                Ver perfil de {top.candidate.shortName}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href={`/${countryCode}`} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full gap-2">
              Ir al dashboard
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const question = resolvedQuestions[currentQuestion];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <Link
          href={`/${countryCode}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="font-mono text-sm font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient">
            Descubre Tu Candidato
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Responde {resolvedQuestions.length} preguntas y descubre con qué candidato
          eres más compatible
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Pregunta {currentQuestion + 1} de {resolvedQuestions.length}
          </span>
          <span className="font-mono tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="h-1 w-full bg-primary" />
            <CardContent className="p-4 sm:p-8 text-center">
              <Badge variant="secondary" className="mb-4 text-xs">
                {question.topic}
              </Badge>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {question.question}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                {question.description}
              </p>

              {/* Answer buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                {([-2, -1, 0, 1, 2] as Answer[]).map((value) => (
                  <motion.button
                    key={value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(value)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      answers[question.id] === value
                        ? answerColors[value]
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {answerLabels[value]}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Show prominent "Ver resultados" CTA when all questions answered */}
      {Object.keys(answers).length === resolvedQuestions.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            size="lg"
            onClick={() => setShowResults(true)}
            className="w-full gap-2 text-base font-bold py-6"
          >
            <CheckCircle2 className="h-5 w-5" />
            Ver resultados
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() =>
            setCurrentQuestion(Math.max(0, currentQuestion - 1))
          }
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        {/* Question dots */}
        <div className="flex gap-1.5">
          {resolvedQuestions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                i === currentQuestion
                  ? "bg-primary w-6"
                  : answers[resolvedQuestions[i].id] !== undefined
                    ? "bg-primary/50"
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            if (currentQuestion < resolvedQuestions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            }
          }}
          disabled={currentQuestion === resolvedQuestions.length - 1}
          className="gap-2"
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
