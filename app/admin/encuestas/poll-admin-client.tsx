"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  poll_average: number;
  poll_trend: string;
  country_code: string;
}

interface PollAdminClientProps {
  candidates: Candidate[];
  country: string;
}

const POLLSTERS = ["Datum", "IEP", "Ipsos", "CPI", "Invamer", "YanHaas", "Guarumo"];

export function PollAdminClient({ candidates, country }: PollAdminClientProps) {
  const [pollster, setPollster] = useState("Datum");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const totalEntered = Object.values(values).filter((v) => v !== "").length;

  async function handleSubmit() {
    const entries = Object.entries(values)
      .filter(([, v]) => v !== "" && !isNaN(parseFloat(v)))
      .map(([candidateId, v]) => ({
        candidate_id: candidateId,
        value: parseFloat(v),
        pollster,
        date,
        country_code: country,
      }));

    if (entries.length === 0) {
      setResult({ ok: false, msg: "No hay valores ingresados." });
      return;
    }

    setSaving(true);
    setResult(null);
    let saved = 0;
    let failed = 0;
    try {
      // Call the existing API once per entry
      for (const entry of entries) {
        const res = await fetch("/api/admin/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (res.ok) saved++;
        else failed++;
      }
      if (saved > 0) {
        setResult({ ok: true, msg: `✓ ${saved} punto${saved > 1 ? "s" : ""} guardado${saved > 1 ? "s" : ""}${failed > 0 ? ` (${failed} errores)` : ""}. Los poll_average se recalcularon.` });
        setValues({});
      } else {
        setResult({ ok: false, msg: `Error guardando los datos (${failed} fallos). ¿Estás logueado al admin?` });
      }
    } catch {
      setResult({ ok: false, msg: "Error de red." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Carga de Encuestas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresá los datos exactos de encuestadoras oficiales. Sin estimaciones.
        </p>
      </div>

      {/* Country toggle */}
      <div className="flex gap-2">
        {["pe", "co"].map((c) => (
          <a
            key={c}
            href={`?country=${c}`}
            className={cn(
              "px-3 py-1 rounded text-sm font-medium border",
              country === c
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {c === "pe" ? "🇵🇪 Perú" : "🇨🇴 Colombia"}
          </a>
        ))}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Encuestadora
          </label>
          <select
            value={pollster}
            onChange={(e) => setPollster(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
          >
            {POLLSTERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Fecha de publicación
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Candidate rows */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-0 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Candidato</span>
          <span className="w-24 text-center">Actual DB</span>
          <span className="w-28 text-center">Nuevo %</span>
        </div>
        <div className="divide-y divide-border">
          {candidates.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_auto_auto] gap-0 items-center px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.short_name}</p>
              </div>
              <div className="w-24 text-center">
                <Badge variant="outline" className="font-mono tabular-nums text-xs">
                  {c.poll_average.toFixed(1)}%
                </Badge>
              </div>
              <div className="w-28 px-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  placeholder="—"
                  value={values[c.id] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                  className="h-8 text-sm text-center font-mono tabular-nums"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalEntered > 0
            ? `${totalEntered} candidato${totalEntered > 1 ? "s" : ""} con valor ingresado`
            : "Ingresá los % de cada candidato según la encuesta"}
        </p>
        <Button onClick={handleSubmit} disabled={saving || totalEntered === 0}>
          {saving ? "Guardando…" : "Guardar encuesta"}
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium",
            result.ok
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          )}
        >
          {result.msg}
        </div>
      )}
    </div>
  );
}
