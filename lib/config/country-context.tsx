"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  type CountryCode,
  type CountryConfig,
  type CountryTheme,
  COUNTRIES,
  DEFAULT_COUNTRY,
} from "./countries";

// =============================================================================
// CONTEXT
// =============================================================================

const CountryContext = createContext<CountryConfig>(COUNTRIES[DEFAULT_COUNTRY]);

// =============================================================================
// THEME APPLICATION — sets CSS custom properties on <html>
// =============================================================================

function applyCountryTheme(theme: CountryTheme) {
  const root = document.documentElement;

  // Primary colors
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", theme.primaryForeground);
  root.style.setProperty("--ring", theme.primary);

  // Chart colors
  root.style.setProperty("--chart-1", theme.chartColors[0]);
  root.style.setProperty("--chart-2", theme.chartColors[1]);
  root.style.setProperty("--chart-3", theme.chartColors[2]);
  root.style.setProperty("--chart-4", theme.chartColors[3]);
  root.style.setProperty("--chart-5", theme.chartColors[4]);

  // Sidebar
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-primary-foreground", theme.primaryForeground);
  root.style.setProperty("--sidebar-ring", theme.primary);

  // Gradient for .text-gradient utility
  root.style.setProperty("--country-gradient", theme.gradient);
}

// =============================================================================
// PROVIDER
// =============================================================================

export function CountryProvider({
  country,
  children,
}: {
  country: CountryCode;
  children: ReactNode;
}) {
  const config = COUNTRIES[country] ?? COUNTRIES[DEFAULT_COUNTRY];

  // Apply theme CSS variables when country changes
  useEffect(() => {
    applyCountryTheme(config.theme);
  }, [config.theme]);

  return (
    <CountryContext.Provider value={config}>{children}</CountryContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useCountry(): CountryConfig {
  return useContext(CountryContext);
}

// =============================================================================
// SERVER UTIL — extract country from route params
// =============================================================================

export function getCountryFromParams(
  params: { country?: string } | Promise<{ country?: string }>
): CountryCode {
  // Handle both sync and async params (Next.js 16+ can have async params)
  const resolved = params instanceof Promise ? undefined : params;
  const code = resolved?.country ?? DEFAULT_COUNTRY;
  return (code in COUNTRIES ? code : DEFAULT_COUNTRY) as CountryCode;
}
