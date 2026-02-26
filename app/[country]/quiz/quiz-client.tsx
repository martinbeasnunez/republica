"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Share2,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Candidate } from "@/lib/data/candidates";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { useCountry } from "@/lib/config/country-context";

interface QuizQuestion {
  id: string;
  question: string | ((countryName: string) => string);
  description: string | ((capital: string) => string);
  topic: string;
}

const questions: QuizQuestion[] = [
  {
    id: "pena-muerte",
    question: "Estas a favor de la pena de muerte para delitos graves?",
    description: "Como violacion, sicariato y terrorismo.",
    topic: "Seguridad",
  },
  {
    id: "estado-empresario",
    question: "El Estado debe tener un rol mas activo en la economia?",
    description: "Incluyendo empresas publicas y regulacion de precios.",
    topic: "Economia",
  },
  {
    id: "inversion-extranjera",
    question: (country) => `Se debe promover mas la inversion extranjera en ${country}?`,
    description: "Con incentivos fiscales y facilidades regulatorias.",
    topic: "Economia",
  },
  {
    id: "mineria",
    question: "La mineria debe expandirse para impulsar la economia?",
    description: "Incluso en zonas sensibles ambientalmente.",
    topic: "Medio Ambiente",
  },
  {
    id: "aborto",
    question: "Estas a favor de despenalizar el aborto en mas causales?",
    description: "Actualmente solo es legal por riesgo de vida de la madre.",
    topic: "Derechos",
  },
  {
    id: "matrimonio-igualitario",
    question: "Estas a favor del matrimonio entre personas del mismo sexo?",
    description: "Con los mismos derechos civiles que el matrimonio tradicional.",
    topic: "Derechos",
  },
  {
    id: "descentralizacion",
    question: "Las regiones deben tener mas autonomia y presupuesto?",
    description: (capital) => `Reduciendo el centralismo de ${capital}.`,
    topic: "Gobernanza",
  },
  {
    id: "educacion-publica",
    question: "Se debe aumentar significativamente el presupuesto en educacion?",
    description: "Hasta alcanzar el 6% del PBI como minimo.",
    topic: "Educacion",
  },
  {
    id: "salud-universal",
    question: (country) => `Todos los ciudadanos de ${country} deben tener acceso a salud gratuita y de calidad?`,
    description: "A traves de un sistema universal de salud.",
    topic: "Salud",
  },
  {
    id: "corrupcion",
    question: "Se necesitan penas mas severas para los funcionarios corruptos?",
    description: "Incluyendo inhabilitacion perpetua y confiscacion de bienes.",
    topic: "Anticorrupcion",
  },
];

function resolveQuestion(q: QuizQuestion, countryName: string, capital: string) {
  return {
    id: q.id,
    question: typeof q.question === "function" ? q.question(countryName) : q.question,
    description: typeof q.description === "function" ? q.description(capital) : q.description,
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

interface QuizClientProps {
  candidates: Candidate[];
}

export default function QuizClient({ candidates }: QuizClientProps) {
  const country = useCountry();
  const countryName = country.name;
  const capital = country.capital;
  const countryCode = country.code;

  const resolvedQuestions = useMemo(
    () => questions.map((q) => resolveQuestion(q, countryName, capital)),
    [countryName, capital]
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

    if (currentQuestion < resolvedQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 200);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

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
            Basado en tus respuestas, estos son los candidatos mas compatibles
            contigo
          </p>
        </motion.div>

        <div className="space-y-3">
          {results.slice(0, 8).map((result, index) => (
            <motion.div
              key={result.candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card
                className={cn(
                  "bg-card border-border overflow-hidden",
                  index === 0 && "border-primary/30 glow-indigo"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold",
                        index === 0
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>

                    {/* Avatar */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          result.candidate.partyColor + "20",
                      }}
                    >
                      <User
                        className="h-5 w-5"
                        style={{ color: result.candidate.partyColor }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {result.candidate.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {result.candidate.party}
                      </p>
                    </div>

                    {/* Compatibility */}
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-mono text-xl font-bold tabular-nums",
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
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
          Responde {resolvedQuestions.length} preguntas y descubre con que candidato
          eres mas compatible
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
            } else if (Object.keys(answers).length === resolvedQuestions.length) {
              setShowResults(true);
            }
          }}
          disabled={currentQuestion === resolvedQuestions.length - 1 && Object.keys(answers).length < resolvedQuestions.length}
          className="gap-2"
        >
          {currentQuestion === resolvedQuestions.length - 1 ? "Ver resultados" : "Siguiente"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
