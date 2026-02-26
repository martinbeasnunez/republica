"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: "indigo" | "emerald" | "amber" | "sky" | "rose";
  delay?: number;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo/10",
    text: "text-indigo",
    glow: "glow-indigo",
    border: "border-indigo/20",
  },
  emerald: {
    bg: "bg-emerald/10",
    text: "text-emerald",
    glow: "glow-emerald",
    border: "border-emerald/20",
  },
  amber: {
    bg: "bg-amber/10",
    text: "text-amber",
    glow: "",
    border: "border-amber/20",
  },
  sky: {
    bg: "bg-sky/10",
    text: "text-sky",
    glow: "",
    border: "border-sky/20",
  },
  rose: {
    bg: "bg-rose/10",
    text: "text-rose",
    glow: "glow-rose",
    border: "border-rose/20",
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "indigo",
  delay = 0,
}: KPICardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:border-primary/20",
        colors.border
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.value > 0 ? "text-emerald" : trend.value < 0 ? "text-rose" : "text-muted-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>
      </div>
    </motion.div>
  );
}
