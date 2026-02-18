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

const mockArticles: NewsArticle[] = [
  {
    id: "1",
    title: "JNE confirma 36 candidatos habilitados para las elecciones presidenciales 2026",
    summary: "El Jurado Nacional de Elecciones publico la lista definitiva de candidatos habilitados para las proximas elecciones presidenciales del 12 de abril.",
    source: "El Comercio",
    time: "Hace 2 horas",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
    isBreaking: true,
  },
  {
    id: "2",
    title: "Lopez Aliaga presenta plan de seguridad ciudadana con pena de muerte",
    summary: "El candidato de Renovacion Popular detallo su propuesta de mano dura contra la delincuencia durante un evento en Lima.",
    source: "RPP Noticias",
    time: "Hace 3 horas",
    category: "Seguridad",
    factCheck: "verified",
    candidates: ["Lopez Aliaga"],
  },
  {
    id: "3",
    title: "Keiko Fujimori promete estabilidad economica y programas sociales focalizados",
    summary: "La candidata de Fuerza Popular presento sus lineamientos economicos en conferencia de prensa.",
    source: "Gestion",
    time: "Hace 4 horas",
    category: "Economia",
    candidates: ["K. Fujimori"],
  },
  {
    id: "4",
    title: "FALSO: Viral desinformativo sobre candidato circula en WhatsApp",
    summary: "El JNE y Ojo Publico desmienten cadena de WhatsApp con informacion falsa sobre supuestas inhabilitaciones.",
    source: "Ojo Publico",
    time: "Hace 5 horas",
    category: "Verificacion",
    factCheck: "false",
    candidates: [],
  },
  {
    id: "5",
    title: "Carlos Alvarez sube en encuestas: efecto outsider se consolida",
    summary: "El comediante y comunicador se posiciona tercero en intencion de voto segun ultima encuesta de IEP.",
    source: "La Republica",
    time: "Hace 6 horas",
    category: "Encuestas",
    factCheck: "verified",
    candidates: ["C. Alvarez"],
  },
  {
    id: "6",
    title: "Debate presidencial: JNE define fecha y formato para marzo 2026",
    summary: "El primer debate presidencial se realizara el 15 de marzo en Lima, con 8 candidatos en el primer bloque.",
    source: "Andina",
    time: "Hace 7 horas",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "7",
    title: "Forsyth propone digitalizacion total del estado peruano",
    summary: "El candidato de Somos Peru presento su plan 'Peru Digital' que incluye gobierno electronico y emprendimiento tech.",
    source: "Infobae Peru",
    time: "Hace 8 horas",
    category: "Tecnologia",
    candidates: ["Forsyth"],
  },
  {
    id: "8",
    title: "Economia peruana crece 3.2% en 2025: contexto para las elecciones",
    summary: "El BCR reporta crecimiento del PBI pero con desafios en empleo formal y desigualdad regional.",
    source: "Semana Economica",
    time: "Hace 10 horas",
    category: "Economia",
    factCheck: "verified",
    candidates: [],
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

  const filtered = mockArticles.filter((a) => {
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
