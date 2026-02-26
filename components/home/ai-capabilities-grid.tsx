"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Newspaper,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Bot,
  User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

// ─── Country-specific preview content ───

const previewContent = {
  pe: {
    chatResponse: "Segun las ultimas encuestas, Lopez Aliaga lidera con 12.3%...",
    factCheckFalse: "Elecciones se adelantan a marzo",
    factCheckTrue: "Padron electoral supera 25 millones",
    newsHeadline: "Lopez Aliaga presenta plan de seguridad...",
    planCandidate: "Economia — Lopez Aliaga",
    planScore: "67/100",
  },
  co: {
    chatResponse: "Segun las ultimas encuestas, Davila lidera con 18.9%...",
    factCheckFalse: "Reforma a la salud es inconstitucional",
    factCheckTrue: "Colombia tiene 39 millones de electores",
    newsHeadline: "Cepeda presenta plan contra la corrupcion...",
    planCandidate: "Economia — Davila",
    planScore: "72/100",
  },
};

interface AICapability {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  sparkleOverlay: boolean;
  color: string;
  colorBg: string;
  gradient: string;
  label: string;
  preview: React.ReactNode;
  cta: string;
  href: string;
  onClick?: () => void;
}

function MiniChat({ content }: { content: typeof previewContent.pe }) {
  return (
    <div className="space-y-1.5 mt-3">
      <div className="flex gap-1.5 justify-end">
        <div className="rounded-md bg-primary/20 px-2 py-1 text-[10px] text-primary-foreground/80 max-w-[80%]">
          Quien lidera las encuestas?
        </div>
        <div className="flex h-4 w-4 items-center justify-center rounded bg-muted flex-shrink-0">
          <User className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex h-4 w-4 items-center justify-center rounded bg-primary/20 flex-shrink-0">
          <Bot className="h-2.5 w-2.5 text-primary" />
        </div>
        <div className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground max-w-[80%]">
          {content.chatResponse}
        </div>
      </div>
    </div>
  );
}

function MiniFactCheck({ content }: { content: typeof previewContent.pe }) {
  return (
    <div className="space-y-1.5 mt-3">
      <div className="flex items-center gap-1.5">
        <XCircle className="h-3 w-3 text-rose flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground truncate">
          &ldquo;{content.factCheckFalse}&rdquo;
        </span>
        <Badge variant="outline" className="text-[8px] h-4 px-1 border-rose/30 text-rose ml-auto flex-shrink-0">
          FALSO
        </Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3 w-3 text-emerald flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground truncate">
          &ldquo;{content.factCheckTrue}&rdquo;
        </span>
        <Badge variant="outline" className="text-[8px] h-4 px-1 border-emerald/30 text-emerald ml-auto flex-shrink-0">
          VERDADERO
        </Badge>
      </div>
    </div>
  );
}

function MiniNewsBias({ content }: { content: typeof previewContent.pe }) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[10px] text-muted-foreground truncate">
        &ldquo;{content.newsHeadline}&rdquo;
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Sesgo detectado</span>
          <span className="text-[9px] font-mono text-emerald">NEUTRAL</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[15%] rounded-full bg-emerald" />
        </div>
      </div>
    </div>
  );
}

function MiniPlanScore({ content }: { content: typeof previewContent.pe }) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{content.planCandidate}</span>
        <span className="text-[10px] font-mono font-bold text-amber tabular-nums">{content.planScore}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Viabilidad</span>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-0.5">
            <div className="h-full w-[55%] rounded-full bg-amber" />
          </div>
        </div>
        <div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Impacto</span>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-0.5">
            <div className="h-full w-[78%] rounded-full bg-sky" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AICapabilitiesGrid() {
  const country = useCountry();
  const cp = `/${country.code}`;
  const content = previewContent[country.code] || previewContent.pe;

  const capabilities: AICapability[] = [
    {
      id: "chat",
      title: "Asistente Electoral IA",
      subtitle: "Pregunta lo que quieras sobre candidatos y propuestas",
      icon: Sparkles,
      sparkleOverlay: false,
      color: "text-primary",
      colorBg: "bg-primary/10",
      gradient: "from-primary via-primary/50 to-transparent",
      label: "CONDOR AI",
      preview: <MiniChat content={content} />,
      cta: "Iniciar conversacion",
      href: `${cp}/verificador`,
    },
    {
      id: "factcheck",
      title: "Verificador de Hechos",
      subtitle: "Verifica cualquier afirmacion electoral en segundos",
      icon: ShieldCheck,
      sparkleOverlay: false,
      color: "text-emerald",
      colorBg: "bg-emerald/10",
      gradient: "from-emerald via-emerald/50 to-transparent",
      label: "FACT-CHECK",
      preview: <MiniFactCheck content={content} />,
      cta: "Verificar afirmacion",
      href: `${cp}/verificador`,
    },
    {
      id: "news",
      title: "Analisis de Noticias IA",
      subtitle: "Detecta sesgo y separa hechos de opiniones",
      icon: Newspaper,
      sparkleOverlay: true,
      color: "text-sky",
      colorBg: "bg-sky/10",
      gradient: "from-sky via-sky/50 to-transparent",
      label: "NEWS INTEL",
      preview: <MiniNewsBias content={content} />,
      cta: "Analizar noticias",
      href: `${cp}/noticias`,
    },
    {
      id: "plans",
      title: "Analisis de Planes IA",
      subtitle: "IA evalua viabilidad e impacto de cada propuesta",
      icon: FileText,
      sparkleOverlay: true,
      color: "text-amber",
      colorBg: "bg-amber/10",
      gradient: "from-amber via-amber/50 to-transparent",
      label: "PLAN ANALYSIS",
      preview: <MiniPlanScore content={content} />,
      cta: "Analizar planes",
      href: `${cp}/planes`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {capabilities.map((cap, index) => (
        <motion.div
          key={cap.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.08 }}
          whileHover={{ y: -2 }}
        >
          <Link href={cap.href} className="block h-full">
            <Card className="bg-card border-border overflow-hidden h-full group neon-border transition-all duration-300">
              {/* Gradient top bar */}
              <div className={cn("h-1 w-full bg-gradient-to-r", cap.gradient)} />

              <CardContent className="p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", cap.colorBg)}>
                    <cap.icon className={cn("h-3.5 w-3.5", cap.color)} />
                    {cap.sparkleOverlay && (
                      <Sparkles className="h-2 w-2 text-primary absolute translate-x-2 -translate-y-2" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[8px] font-mono h-4 px-1.5">
                    {cap.label}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-foreground mt-1 group-hover:text-primary transition-colors">
                  {cap.title}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  {cap.subtitle}
                </p>

                {/* Mini preview */}
                <div className="flex-1">
                  {cap.preview}
                </div>

                {/* CTA */}
                <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {cap.cta}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
