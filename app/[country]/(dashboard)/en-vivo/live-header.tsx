"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, Clock, Tv, ExternalLink } from "lucide-react";
import { useCountry } from "@/lib/config/country-context";
import type { ElectoralEvent } from "@/lib/config/countries";

interface LiveHeaderProps {
  activeEvent?: ElectoralEvent | null;
  nextEvent?: ElectoralEvent | null;
}

/**
 * Pick whichever election (first round or runoff) is the active context "today".
 * Preference order: today === runoff → runoff; today === first round → first round;
 * else whichever is within +7 days; else fall back to first round.
 */
function getEffectiveElectionDate(
  electionDate: string,
  electionDateSecondRound: string | undefined,
  todayLocal: string
): { date: string; isRunoff: boolean } {
  if (electionDateSecondRound) {
    const runoff = new Date(electionDateSecondRound + "T12:00:00");
    const today = new Date(todayLocal + "T12:00:00");
    const diffRunoff = Math.floor((today.getTime() - runoff.getTime()) / 86_400_000);
    if (diffRunoff >= 0 && diffRunoff <= 7) {
      return { date: electionDateSecondRound, isRunoff: true };
    }
  }
  return { date: electionDate, isRunoff: false };
}

export function LiveHeader({ activeEvent, nextEvent }: LiveHeaderProps) {
  const country = useCountry();
  const [localTime, setLocalTime] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isRunoffMode, setIsRunoffMode] = useState(false);

  const tz = country.timezone;
  const locale = country.locale.replace("_", "-");
  const isCO = country.code === "co";
  const electoralAuthority = isCO ? "Registraduría" : "ONPE";
  // Horario de mesas por país: CO 8a–4p, PE 8a–5p
  const closingHour = isCO ? 16 : 17;
  const closingHourLabel = isCO ? "4:00 p.m." : "5:00 p.m.";
  // Vocabulario electoral por país
  const pollingSite = isCO ? "puestos de votación" : "mesas";
  const pollingSiteCap = isCO ? "Puestos de votación" : "Mesas";
  // Gender-correct adjective for the polling site noun.
  // "Puestos abiertos" (masc) / "Mesas abiertas" (fem)
  const openedAdj = isCO ? "abiertos" : "abiertas";
  const closedAdj = isCO ? "cerrados" : "cerradas";
  // Country article: "Colombia" (no article), "el Perú" (with article)
  const countryArticle = isCO ? "" : "el ";
  const countResult = isCO ? "preconteo" : "conteo";
  const countResultCap = isCO ? "Preconteo" : "Conteo";
  const actaTerm = isCO ? "formularios E-14" : "actas";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const localNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      setLocalTime(
        localNow.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );

      // Hora real del país (NO la del browser). Extraemos hour:minute juntos
      // para evitar problemas de borde con timezones del navegador.
      const localHM = now.toLocaleString("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const [hStr, mStr] = localHM.split(":");
      const localHour = parseInt(hStr, 10);
      const localMinute = parseInt(mStr, 10);
      // Total minutos desde medianoche para comparaciones precisas con el cierre.
      const localTotalMin = localHour * 60 + localMinute;
      const closeTotalMin = closingHour * 60; // 16:00 = 960 min para CO

      const todayLocal = now.toLocaleDateString("en-CA", { timeZone: tz });
      const { date: elDate, isRunoff } = getEffectiveElectionDate(
        country.electionDate,
        country.electionDateSecondRound,
        todayLocal
      );
      setIsRunoffMode(isRunoff);
      const phaseLabel = isRunoff ? "balotaje" : "jornada electoral";
      const isElectionDay = todayLocal === elDate;
      const dayBefore = new Date(new Date(elDate + "T12:00:00").getTime() - 86400000).toISOString().split("T")[0];
      const isDayBefore = todayLocal === dayBefore;
      const dayAfter = new Date(new Date(elDate + "T12:00:00").getTime() + 86400000).toISOString().split("T")[0];
      const isDayAfter = todayLocal === dayAfter;

      if (isElectionDay) {
        if (localHour < 8) {
          setStatusText(`${isRunoff ? "Balotaje" : "Jornada electoral"} iniciando en ${country.name} — ${pollingSite} instalándose`);
        } else if (localTotalMin < closeTotalMin - 60) {
          // Antes de las 3:00 p.m. — votación normal
          setStatusText(`${pollingSiteCap} ${openedAdj} en todo ${countryArticle}${country.name} — ${isRunoff ? "balotaje" : "votación"} en curso`);
        } else if (localTotalMin < closeTotalMin) {
          // Última hora antes del cierre (3:00–3:59 p.m. para CO)
          setStatusText(`Última hora para votar en el ${phaseLabel} — ${pollingSite} cierran a las ${closingHourLabel}`);
        } else if (localTotalMin < closeTotalMin + 60) {
          // 4:00–4:59 p.m. — puestos cerrados, escrutinio arrancando
          setStatusText(`${pollingSiteCap} ${closedAdj} — inicia el escrutinio del ${phaseLabel} en cada ${isCO ? "puesto" : "mesa"}`);
        } else if (localTotalMin < closeTotalMin + 4 * 60) {
          // 5:00–7:59 p.m. — primeros boletines del preconteo
          setStatusText(`${countResultCap} del ${phaseLabel} en curso — primeros boletines de los ${actaTerm}`);
        } else if (localHour >= 20 && localHour < 23) {
          // 8:00–10:59 p.m. — escrutinio nacional
          setStatusText(`${countResultCap} oficial del ${phaseLabel} en curso — ${electoralAuthority} procesando ${actaTerm}`);
        } else {
          setStatusText(`${countResultCap} oficial del ${phaseLabel} continúa — resultados parciales disponibles en ${electoralAuthority}`);
        }
      } else if (isDayBefore) {
        setStatusText(`Víspera del ${phaseLabel} — cobertura en tiempo real`);
      } else if (isDayAfter) {
        setStatusText(`${countResultCap} oficial del ${phaseLabel} continúa — ${electoralAuthority} procesando ${actaTerm} a nivel nacional`);
      } else {
        setStatusText("Cobertura electoral en tiempo real");
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // Todas las strings localizadas derivan de country.code, así que basta con incluir country.code.
  }, [country.code, country.electionDate, country.electionDateSecondRound, country.name, tz, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show today's date if we're on either election day, otherwise show now.
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: tz });
  const effectiveElectionDate = isRunoffMode && country.electionDateSecondRound
    ? country.electionDateSecondRound
    : country.electionDate;
  const showDate = todayStr === effectiveElectionDate
    ? new Date(effectiveElectionDate + "T12:00:00")
    : now;
  const electionDateFormatted = showDate.toLocaleDateString(
    locale,
    { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-950 via-red-900 to-stone-900"
    >
      <div className="px-5 sm:px-8 py-5 sm:py-6">
        {/* Top row: EN VIVO badge + clock */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-white pulse-dot" />
              <span className="text-[11px] font-bold text-white tracking-wide">EN VIVO</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />
              <span className="text-sm font-bold text-white">
                Cobertura Electoral{isRunoffMode && " · Segunda Vuelta"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-200/80">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono text-sm tabular-nums font-bold">{localTime}</span>
            <span className="text-[10px] text-red-300/50">{country.capital}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-white mb-1">
          {isRunoffMode ? "Balotaje Presidencial" : "Elecciones"} {country.name} {new Date().getFullYear()}
        </h1>
        <p className="text-xs sm:text-sm text-red-200/70 mb-3">
          {electionDateFormatted} — {isRunoffMode ? "Segunda vuelta presidencial" : country.electionType}
        </p>

        {/* Status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-xs text-emerald-300 font-medium">{statusText}</span>
        </div>

        {/* AI curation badge */}
        <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 w-fit">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 pulse-dot" />
          <span className="text-[10px] text-red-100/80 font-mono">
            CONDOR AI curando noticias y verificando hechos en tiempo real
          </span>
        </div>

        {/* Active event overlay */}
        {activeEvent && (
          <div className="mt-4 pt-4 border-t border-red-700/50">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Transmitiendo ahora</p>
                <p className="text-sm font-bold text-white truncate">{activeEvent.title}</p>
                <p className="text-[11px] text-red-200/60">
                  {activeEvent.organizer} · {activeEvent.startTime} — {activeEvent.endTime}
                </p>
              </div>
              {activeEvent.broadcastUrl && (
                <a
                  href={activeEvent.broadcastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-400 text-white font-bold text-xs px-4 py-2 transition-colors"
                >
                  <Tv className="h-3.5 w-3.5" />
                  Ver en vivo
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {activeEvent.broadcastChannels && (
              <p className="text-[10px] text-red-300/40 mt-2 font-mono">
                También en: {activeEvent.broadcastChannels.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
