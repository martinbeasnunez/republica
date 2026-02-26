"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, setCountryCookie } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import { COUNTRIES, getElectionCountdown, type CountryCode } from "@/lib/config/countries";
import {
  LayoutDashboard,
  Users,
  Map,
  BarChart3,
  Newspaper,
  ShieldCheck,
  FileText,
  HelpCircle,
  Radio,
  Scan,
  Dice6,
  Target,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { Changelog } from "@/components/dashboard/changelog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navigation = [
  // ─── Core ───
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Candidatos", href: "/candidatos", icon: Users },
  { name: "Encuestas", href: "/encuestas", icon: BarChart3 },
  { name: "Noticias", href: "/noticias", icon: Newspaper },
  // ─── Herramientas ───
  { name: "Quiz Electoral", href: "/quiz", icon: HelpCircle },
  { name: "Planes de Gobierno", href: "/planes", icon: FileText },
  { name: "Verificador", href: "/verificador", icon: ShieldCheck },
  // ─── Análisis profundo ───
  { name: "Pilares", href: "/pilares", icon: Target },
  { name: "Radiografía", href: "/radiografia", icon: Scan, badge: "NEW" as const },
  { name: "Simulador", href: "/simulador", icon: Dice6, badge: "NEW" as const, nameByCountry: { co: "Escenarios" } as Record<string, string> },
  { name: "Mapa Electoral", href: "/mapa", icon: Map },
  // ─── Extras ───
  { name: "Metodología", href: "/metodologia", icon: BookOpen },
  { name: "En Vivo", href: "/en-vivo", icon: Radio, badge: "LIVE" as const },
];

// ─── Country-aware href ───
function useCountryHref(href: string): string {
  const country = useCountry();
  if (href === "/") return `/${country.code}`;
  return `/${country.code}${href}`;
}

function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: (typeof navigation)[0];
  isActive: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const fullHref = useCountryHref(item.href);
  const country = useCountry();
  const displayName = item.nameByCountry?.[country.code] ?? item.name;

  return (
    <Link
      href={fullHref}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary glow-indigo"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1">{displayName}</span>
          {item.badge && (
            <span
              className={cn(
                "flex h-5 items-center rounded-full px-2 text-[10px] font-bold",
                item.badge === "LIVE"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-primary/20 text-primary"
              )}
            >
              {item.badge === "LIVE" && (
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-400 pulse-dot" />
              )}
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ─── Country Switcher ───
function CountrySwitcher({ collapsed }: { collapsed?: boolean }) {
  const country = useCountry();
  const pathname = usePathname();
  const router = useRouter();

  const switchCountry = (code: CountryCode) => {
    setCountryCookie(code);
    // Replace current country prefix with new one
    const currentPrefix = `/${country.code}`;
    const newPrefix = `/${code}`;
    const newPath = pathname.startsWith(currentPrefix)
      ? pathname.replace(currentPrefix, newPrefix)
      : `${newPrefix}`;
    router.push(newPath);
  };

  const otherCountries = Object.values(COUNTRIES).filter(
    (c) => c.code !== country.code
  );

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg">{country.emoji}</span>
        {otherCountries.map((c) => (
          <button
            key={c.code}
            onClick={() => switchCountry(c.code)}
            className="text-lg opacity-30 hover:opacity-100 transition-opacity"
          >
            {c.emoji}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Current */}
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
        <span className="text-base">{country.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{country.name}</p>
          <p className="text-[9px] text-muted-foreground font-mono">
            {country.electionType} {country.electionDate.slice(0, 4)}
          </p>
        </div>
      </div>
      {/* Others */}
      {otherCountries.map((c) => (
        <button
          key={c.code}
          onClick={() => switchCountry(c.code)}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <span className="text-base opacity-60">{c.emoji}</span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs truncate">{c.name}</p>
          </div>
          <Globe className="h-3 w-3 opacity-40" />
        </button>
      ))}
      {/* Link to country landing */}
      <Link
        href="/?select=true"
        className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <Globe className="h-3 w-3" />
        Ver todos los paises
      </Link>
    </div>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden text-muted-foreground hover:text-foreground"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Abrir menu</span>
    </Button>
  );
}

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const country = useCountry();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">
                C
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-gradient">
                CONDOR
              </span>
              <span className="text-[10px] tracking-widest text-muted-foreground">
                {country.name.toUpperCase()} {country.electionDate.slice(0, 4)}
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        {/* Country switcher */}
        <div className="px-3 py-3 border-b border-border">
          <CountrySwitcher />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {navigation.map((item) => {
            const fullHref =
              item.href === "/"
                ? `/${country.code}`
                : `/${country.code}${item.href}`;
            const isActive =
              item.href === "/"
                ? pathname === `/${country.code}` || pathname === `/${country.code}/`
                : pathname.startsWith(fullHref);
            return (
              <NavLink
                key={item.name}
                item={item}
                isActive={isActive}
                onClick={() => onOpenChange(false)}
              />
            );
          })}
        </nav>
        <div className="border-t border-border p-4 space-y-3">
          <ElectionCountdown />
          <Changelog />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const country = useCountry();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 lg:flex",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href={`/${country.code}`} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">
              C
            </span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-gradient">
                CONDOR
              </span>
              <span className="text-[10px] tracking-widest text-muted-foreground">
                {country.name.toUpperCase()} {country.electionDate.slice(0, 4)}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Country Switcher */}
      <div className="border-b border-border p-3">
        <CountrySwitcher collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navigation.map((item) => {
          const fullHref =
            item.href === "/"
              ? `/${country.code}`
              : `/${country.code}${item.href}`;
          const isActive =
            item.href === "/"
              ? pathname === `/${country.code}` || pathname === `/${country.code}/`
              : pathname.startsWith(fullHref);

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <NavLink item={item} isActive={isActive} collapsed />
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.name}
                  {item.badge && (
                    <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <NavLink key={item.name} item={item} isActive={isActive} />;
        })}
      </nav>

      {/* Collapse */}
      <div className="border-t border-border p-3 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </Button>
      </div>

      {/* Election countdown + changelog */}
      {!collapsed && (
        <div className="border-t border-border p-4">
          <ElectionCountdown />
          <Changelog />
        </div>
      )}
    </aside>
  );
}

function ElectionCountdown() {
  const country = useCountry();
  const days = getElectionCountdown(country.code);

  return (
    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Elecciones en
      </p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-gradient">
        {days}
      </p>
      <p className="text-[10px] text-muted-foreground">dias</p>
    </div>
  );
}
