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

  if (showResults) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">
            Tus Resultados
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Basado en tus respuestas, estos son los candidatos más compatibles
            contigo
          </p>
        </motion.div>

        <div className="space-y-3">
          {results.slice(0, 8).map((result, index) => {
            const breakdown = getTopicBreakdown(answers, result.candidate, resolvedQuestions);
            const agrees = countAgreements(breakdown);
            const isTop = index === 0;
            const isExpanded = isTop || expandedId === result.candidate.id;

            return (
              <motion.div
                key={result.candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className={cn(
                    "bg-card border-border overflow-hidden",
                    isTop && "border-primary/30 glow-indigo"
                  )}
                >
                  <CardContent className={cn("p-4", isTop && "p-5")}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Rank */}
                      <span
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold",
                          isTop
                            ? "h-9 w-9 bg-primary text-white"
                            : "h-8 w-8 bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>

                      {/* Photo */}
                      <div
                        className={cn(
                          "relative shrink-0 overflow-hidden rounded-full border-2",
                          isTop ? "h-14 w-14" : "h-10 w-10"
                        )}
                        style={{ borderColor: result.candidate.partyColor }}
                      >
                        {result.candidate.photo ? (
                          <Image
                            src={result.candidate.photo}
                            alt={result.candidate.name}
                            fill
                            className="object-cover"
                            sizes={isTop ? "56px" : "40px"}
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center"
                            style={{
                              backgroundColor: result.candidate.partyColor + "20",
                            }}
                          >
                            <User
                              className={cn(isTop ? "h-7 w-7" : "h-5 w-5")}
                              style={{ color: result.candidate.partyColor }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-semibold text-foreground truncate",
                            isTop ? "text-base" : "text-sm"
                          )}
                        >
                          {result.candidate.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: result.candidate.partyColor + "20",
                              color: result.candidate.partyColor,
                            }}
                          >
                            {result.candidate.party}
                          </span>
                          {!isTop && (
                            <span className="text-[11px] text-muted-foreground hidden sm:inline">
                              Coinciden en {agrees}/{resolvedQuestions.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compatibility */}
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "font-mono font-bold tabular-nums",
                            isTop ? "text-2xl" : "text-xl",
                            result.compatibility >= 70
                              ? "text-emerald"
                              : result.compatibility >= 50
                                ? "text-amber"
                                : "text-muted-foreground"
                          )}
                        >
                          {result.compatibility}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          compatible
                        </p>
                      </div>
                    </div>

                    {/* Compatibility bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: result.candidate.partyColor,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${result.compatibility}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.08,
                        }}
                      />
                    </div>

                    {/* Topic breakdown — always open for #1, expandable for others */}
                    {!isTop && (
                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === result.candidate.id
                              ? null
                              : result.candidate.id
                          )
                        }
                        className="mt-3 flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>
                          Coinciden en {agrees} de {resolvedQuestions.length} temas
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    )}

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={isTop ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className={cn("space-y-1.5", isTop ? "mt-4 pt-4 border-t border-border" : "mt-2")}>
                            {isTop && (
                              <p className="text-xs font-semibold text-foreground mb-2">
                                ¿Por qué coincides con {result.candidate.shortName}?
                              </p>
                            )}
                            {breakdown.map((topic) => (
                              <div
                                key={topic.topicId}
                                className="flex items-center gap-2 text-xs"
                              >
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
                                    : topic.match === "partial"
                                      ? `Tú: ${positionLabel(topic.userAnswer).toLowerCase()} · Candidato: ${positionLabel(topic.candidatePosition).toLowerCase()}`
                                      : `Tú: ${positionLabel(topic.userAnswer).toLowerCase()} · Candidato: ${positionLabel(topic.candidatePosition).toLowerCase()}`}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Link to full profile for top candidate */}
                          {isTop && (
                            <Link
                              href={`/${countryCode}/candidatos/${result.candidate.slug}`}
                              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                            >
                              Ver perfil completo de {result.candidate.shortName}
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <WhatsAppCTA context="quiz" />

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Repetir quiz
          </Button>
          <Button className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir resultados
          </Button>
          <Link href={`/${countryCode}`}>
            <Button variant="ghost" className="gap-2">
              Ir al dashboard
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
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
