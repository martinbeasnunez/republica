"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Calendar, Tag } from "lucide-react";

interface Subscriber {
  id: string;
  phone: string;
  interests: string[];
  is_active: boolean;
  subscribed_at: string;
}

function maskPhone(phone: string): string {
  // Show +51 9XX XXX X89 format
  if (phone.length >= 12) {
    return phone.slice(0, 4) + " " + phone.slice(4, 5) + "XX XXX " + phone.slice(-2) + "X";
  }
  return phone.slice(0, 6) + "****";
}

const interestLabels: Record<string, { label: string; emoji: string }> = {
  encuestas: { label: "Encuestas", emoji: "📊" },
  noticias: { label: "Noticias", emoji: "🔴" },
  alertas: { label: "Alertas", emoji: "👤" },
  verificacion: { label: "Verificacion", emoji: "✅" },
};

export function SubscriptoresClient({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suscriptores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} activos de {subscribers.length} total
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald/10 border border-emerald/20 px-3 py-2">
          <Users className="h-4 w-4 text-emerald" />
          <span className="text-sm font-mono font-bold text-emerald">
            {activeCount}
          </span>
        </div>
      </motion.div>

      {/* Interest breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              Intereses populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(interestLabels).map(([key, { label, emoji }]) => {
                const count = subscribers.filter(
                  (s) => s.interests?.includes(key)
                ).length;
                const pct =
                  subscribers.length > 0
                    ? Math.round((count / subscribers.length) * 100)
                    : 0;
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-border bg-card p-3 text-center"
                  >
                    <span className="text-lg">{emoji}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {label}
                    </p>
                    <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                      {count}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {pct}%
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscribers table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Listado de suscriptores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No hay suscriptores aun
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Telefono
                        </div>
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        Intereses
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        Estado
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Fecha
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2.5 font-mono text-xs text-foreground">
                          {maskPhone(sub.phone)}
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {sub.interests?.map((interest) => (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {interestLabels[interest]?.emoji || "•"}{" "}
                                {interestLabels[interest]?.label || interest}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={sub.is_active ? "default" : "secondary"}
                            className={`text-[10px] px-1.5 py-0 ${sub.is_active ? "bg-emerald/20 text-emerald border-emerald/30" : ""}`}
                          >
                            {sub.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground font-mono">
                          {new Date(sub.subscribed_at).toLocaleDateString(
                            "es-PE",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
