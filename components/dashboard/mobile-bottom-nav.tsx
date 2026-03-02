"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BarChart3, Newspaper, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

interface BottomTab {
  name: string;
  href: string | null;
  icon: typeof LayoutDashboard;
  highlight?: boolean;
}

const tabs: BottomTab[] = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Encuestas", href: "/encuestas", icon: BarChart3 },
  { name: "Candidatos", href: "/candidatos", icon: Users },
  { name: "Noticias", href: "/noticias", icon: Newspaper },
  { name: "Más", href: null, icon: Menu },
];

export function MobileBottomNav({
  onMoreClick,
}: {
  onMoreClick: () => void;
}) {
  const pathname = usePathname();
  const country = useCountry();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="border-t border-border bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div
          className="flex items-center justify-around"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {tabs.map((tab) => {
            if (tab.href === null) {
              // "Más" button — opens MobileNav Sheet
              return (
                <button
                  key={tab.name}
                  onClick={onMoreClick}
                  className="flex flex-1 flex-col items-center gap-0.5 py-2 text-muted-foreground transition-colors active:text-foreground"
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{tab.name}</span>
                </button>
              );
            }

            const fullHref =
              tab.href === "/"
                ? `/${country.code}`
                : `/${country.code}${tab.href}`;
            const isActive =
              tab.href === "/"
                ? pathname === `/${country.code}` ||
                  pathname === `/${country.code}/`
                : pathname.startsWith(fullHref);

            return (
              <Link
                key={tab.name}
                href={fullHref}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <div className="relative">
                  <tab.icon
                    className={cn(
                      "h-5 w-5",
                      tab.highlight && isActive && "fill-primary/20"
                    )}
                  />
                  {tab.highlight && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive && "font-bold"
                  )}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
