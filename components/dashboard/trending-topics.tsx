"use client";

import { motion } from "framer-motion";
import { TrendingUp, MessageSquare, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  mentions: number;
  sentiment: "positive" | "negative" | "neutral";
  relatedCandidates: string[];
}

const mockTopics: Topic[] = [
  {
    id: "1",
    name: "Seguridad ciudadana",
    mentions: 15420,
    sentiment: "negative",
    relatedCandidates: ["Lopez Aliaga", "Urresti", "Forsyth"],
  },
  {
    id: "2",
    name: "Debate presidencial",
    mentions: 12800,
    sentiment: "neutral",
    relatedCandidates: ["Todos los candidatos"],
  },
  {
    id: "3",
    name: "Economia y empleo",
    mentions: 9300,
    sentiment: "neutral",
    relatedCandidates: ["K. Fujimori", "Lopez Aliaga"],
  },
  {
    id: "4",
    name: "Educacion publica",
    mentions: 7100,
    sentiment: "positive",
    relatedCandidates: ["C. Alvarez", "De la Torre"],
  },
  {
    id: "5",
    name: "Corrupcion",
    mentions: 6800,
    sentiment: "negative",
    relatedCandidates: ["C. Alvarez", "A. Humala"],
  },
];

const sentimentColors = {
  positive: "text-emerald",
  negative: "text-rose",
  neutral: "text-sky",
};

export function TrendingTopics() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Temas Tendencia
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Ultimo 24h
        </span>
      </div>

      <div className="p-2">
        {mockTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent cursor-pointer"
          >
            <Hash
              className={cn(
                "h-4 w-4",
                sentimentColors[topic.sentiment]
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {topic.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {topic.relatedCandidates.join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span className="font-mono text-xs tabular-nums">
                {(topic.mentions / 1000).toFixed(1)}k
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
