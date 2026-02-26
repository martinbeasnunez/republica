"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

/** Centralized ECharts color tokens that adapt to light/dark theme */
export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return useMemo(
    () => ({
      isDark,
      tooltip: {
        backgroundColor: isDark ? "#14131e" : "#ffffff",
        borderColor: isDark ? "#1e1c2e" : "#e2e8f0",
        textColor: isDark ? "#f1f5f9" : "#0f172a",
      },
      axis: {
        lineColor: isDark ? "#1e1c2e" : "#e2e8f0",
        labelColor: isDark ? "#94a3b8" : "#64748b",
        splitLineColor: isDark ? "#1e1c2e" : "#f1f5f9",
      },
      text: {
        primary: isDark ? "#f1f5f9" : "#0f172a",
        muted: isDark ? "#94a3b8" : "#64748b",
      },
    }),
    [isDark]
  );
}

export type ChartTheme = ReturnType<typeof useChartTheme>;
