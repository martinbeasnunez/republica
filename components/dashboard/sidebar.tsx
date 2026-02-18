"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
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
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Candidatos",
    href: "/candidatos",
    icon: Users,
  },
  {
    name: "Mapa Electoral",
    href: "/mapa",
    icon: Map,
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: BarChart3,
  },
  {
    name: "Noticias",
    href: "/noticias",
    icon: Newspaper,
  },
  {
    name: "Verificador",
    href: "/verificador",
    icon: ShieldCheck,
  },
  {
    name: "Radiografia",
    href: "/radiografia",
    icon: Scan,
    badge: "NEW",
  },
  {
    name: "Simulador",
    href: "/simulador",
    icon: Dice6,
    badge: "NEW",
  },
  {
    name: "Planes de Gobierno",
    href: "/planes",
    icon: FileText,
  },
  {
    name: "Quiz Electoral",
    href: "/quiz",
    icon: HelpCircle,
    external: true,
  },
  {
    name: "En Vivo",
    href: "/en-vivo",
    icon: Radio,
    badge: "LIVE",
  },
];

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
  return (
    <Link
      href={item.href}
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
          <span className="flex-1">{item.name}</span>
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">
                A
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-gradient">
                AGORA
              </span>
              <span className="text-[10px] tracking-widest text-gold">
                PERU 2026
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
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
        <div className="border-t border-border p-4">
          <ElectionCountdown />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar() {
  const pathname = usePathname();
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
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">
              A
            </span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-gradient">
                AGORA
              </span>
              <span className="text-[10px] tracking-widest text-gold">
                PERU 2026
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

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

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
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

      {/* Election countdown */}
      {!collapsed && (
        <div className="border-t border-border p-4">
          <ElectionCountdown />
        </div>
      )}
    </aside>
  );
}

function ElectionCountdown() {
  const electionDate = new Date("2026-04-12T08:00:00-05:00");
  const now = new Date();
  const diff = electionDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

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
