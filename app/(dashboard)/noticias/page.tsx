"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Newspaper,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  time: string;
  category: string;
  factCheck?: "verified" | "questionable" | "false";
  candidates: string[];
  imageUrl?: string;
  isBreaking?: boolean;
}

const articles: NewsArticle[] = [
  {
    id: "1",
    title: "Congreso destituye a Jose Jeri tras 130 dias como presidente del Peru",
    summary: "El Congreso oficializo la destitucion de Jose Jeri como jefe de Estado tras el escandalo 'Chifagate'. Peru suma su octavo relevo presidencial en casi diez anos de inestabilidad politica.",
    source: "Infobae",
    sourceUrl: "https://www.infobae.com/peru/2026/02/17/jose-jeri-fue-destituido-como-y-cuando-se-elegira-al-nuevo-presidente-de-peru-y-quienes-son-los-principales-candidatos/",
    time: "17 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
    isBreaking: true,
  },
  {
    id: "2",
    title: "Candidatos presidenciales se pronuncian ante la destitucion de Jeri a dos meses de las elecciones",
    summary: "Los candidatos para las elecciones de abril expresaron sus posturas frente a la destitucion del presidente interino, en un contexto de alta tension politica.",
    source: "Infobae",
    sourceUrl: "https://www.infobae.com/peru/2026/02/17/candidatos-presidenciales-se-pronuncian-ante-la-destitucion-de-jose-jeri-a-dos-meses-de-las-elecciones-2026/",
    time: "17 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "3",
    title: "JNE sorteara este viernes 20 las seis fechas para el debate presidencial",
    summary: "El debate contara con 36 candidatos en dos fases y seis fechas entre la ultima semana de marzo e inicios de abril. Cada jornada tendra 12 candidatos en grupos de tres.",
    source: "Andina",
    sourceUrl: "https://andina.pe/agencia/noticia-elecciones-2026-jne-sorteara-este-viernes-20-las-seis-fechas-para-debate-presidencial-1063248.aspx",
    time: "17 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "4",
    title: "Debate presidencial 2026 en seis fechas: como se organizara y cuando debatiran los 36 candidatos",
    summary: "El JNE revela el formato del debate: dos fases, seis fechas entre el 23 de marzo y 1 de abril, con intervenciones de 2 a 3 minutos por candidato.",
    source: "El Comercio",
    sourceUrl: "https://elcomercio.pe/politica/elecciones/elecciones-debate-presidencial-2026-en-seis-fechas-como-se-organizara-y-cuando-debatiran-los-36-candidatos-tlcnota-noticia/",
    time: "16 Feb 2026",
    category: "Politica",
    candidates: [],
  },
  {
    id: "5",
    title: "Encuesta Ipsos febrero: cuatro candidatos empatados en el tercer lugar",
    summary: "Lopez Aliaga lidera con 12%, Keiko Fujimori segunda con 8%. Acuna, Vizcarra, Alvarez y Lopez-Chau empatados en tercer lugar con 4% cada uno.",
    source: "Infobae",
    sourceUrl: "https://www.infobae.com/peru/2026/02/12/asi-van-las-encuestas-a-solo-dos-meses-de-las-elecciones-2026-cuatro-candidatos-empatados-en-el-tercer-lugar/",
    time: "12 Feb 2026",
    category: "Encuestas",
    factCheck: "verified",
    candidates: ["Lopez Aliaga", "K. Fujimori"],
  },
  {
    id: "6",
    title: "Lista completa de los 36 candidatos oficiales a la presidencia para las elecciones 2026",
    summary: "La lista oficial confirmada por el JNE incluye a Keiko Fujimori, Lopez Aliaga, Cesar Acuna, George Forsyth, entre los 36 candidatos habilitados para el 12 de abril.",
    source: "La Republica",
    sourceUrl: "https://larepublica.pe/politica/2026/02/12/quienes-son-los-candidatos-presidenciales-elecciones-peru-2026-lista-oficial-confirmada-por-jne-hnews-740868",
    time: "12 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "7",
    title: "Lopez Aliaga: las 15 controversiales propuestas para llamar atencion y ganar votos",
    summary: "Analisis de las propuestas del candidato de Renovacion Popular que lidera las encuestas, incluyendo reduccion del Estado, duplicar Pension 65 y fusion de ministerios.",
    source: "La Republica",
    sourceUrl: "https://larepublica.pe/politica/2026/02/08/lopez-aliaga-las-15-controversiales-propuestas-para-llamar-atencion-y-ganar-votos-elecciones-2026-hnews-267416",
    time: "8 Feb 2026",
    category: "Seguridad",
    candidates: ["Lopez Aliaga"],
  },
  {
    id: "8",
    title: "Keiko Fujimori plantea que Fuerzas Armadas controlen carceles y fronteras",
    summary: "La candidata de Fuerza Popular propone que las FF.AA. tomen control de penales y fronteras, ademas de participar en rastrillajes conjuntos con la Policia.",
    source: "Andina",
    sourceUrl: "https://andina.pe/agencia/noticia-elecciones-2026-keiko-fujimori-plantea-fuerzas-armadas-controlen-carceles-y-fronteras-1062965.aspx",
    time: "6 Feb 2026",
    category: "Seguridad",
    factCheck: "verified",
    candidates: ["K. Fujimori"],
  },
];

const factCheckStyles = {
  verified: {
    icon: ShieldCheck,
    label: "Verificado",
    className: "text-emerald bg-emerald/10 border-emerald/20",
  },
  questionable: {
    icon: AlertTriangle,
    label: "Cuestionable",
    className: "text-amber bg-amber/10 border-amber/20",
  },
  false: {
    icon: AlertTriangle,
    label: "Falso",
    className: "text-rose bg-rose/10 border-rose/20",
  },
};

const categories = [
  "Todos",
  "Politica",
  "Economia",
  "Seguridad",
  "Encuestas",
  "Verificacion",
  "Tecnologia",
];

export default function NoticiasPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filtered = articles.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "Todos" || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Noticias</h1>
          <div className="ml-2 flex items-center gap-1.5 rounded-full bg-emerald/10 border border-emerald/20 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald pulse-dot" />
            <span className="text-[11px] font-medium text-emerald">
              Tiempo real
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Noticias electorales verificadas de los principales medios peruanos
        </p>
      </motion.div>

      {/* Search + filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar noticias..."
            className="pl-10 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filtered.map((article, index) => {
          const cardContent = (
            <Card
              className={cn(
                "bg-card border-border transition-all duration-200",
                article.sourceUrl && "hover:border-primary/20 cursor-pointer",
                article.isBreaking && "border-rose/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Breaking badge */}
                    {article.isBreaking && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose">
                          Ultima hora
                        </span>
                      </div>
                    )}

                    <h3 className={cn(
                      "text-sm font-semibold text-foreground line-clamp-2",
                      article.sourceUrl && "group-hover:text-primary transition-colors"
                    )}>
                      {article.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-medium text-primary">
                        {article.source}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.time}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {article.category}
                      </Badge>
                      {article.candidates.map((c) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className="text-[10px] h-5"
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Fact check + link */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {article.factCheck && (
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-md border px-2 py-1",
                          factCheckStyles[article.factCheck].className
                        )}
                      >
                        {(() => {
                          const Icon = factCheckStyles[article.factCheck!].icon;
                          return <Icon className="h-3 w-3" />;
                        })()}
                        <span className="text-[10px] font-medium">
                          {factCheckStyles[article.factCheck].label}
                        </span>
                      </div>
                    )}
                    {article.sourceUrl && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  {cardContent}
                </a>
              ) : (
                cardContent
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
