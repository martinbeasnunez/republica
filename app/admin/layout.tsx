"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Shield,
  ClipboardList,
  Brain,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Brain", href: "/admin/brain", icon: Brain },
  { name: "Quiz", href: "/admin/quiz", icon: ClipboardList },
  { name: "Suscriptores", href: "/admin/suscriptores", icon: Users },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
];

function CountrySwitcher() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = (searchParams.get("country") as CountryCode) || "pe";

  const switchCountry = (code: CountryCode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("country", code);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {(Object.values(COUNTRIES)).map((c) => (
        <button
          key={c.code}
          onClick={() => switchCountry(c.code)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
            current === c.code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="text-sm">{c.emoji}</span>
          <span className="hidden sm:inline">{c.name}</span>
        </button>
      ))}
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Preserve country param in nav links
  const country = searchParams.get("country") || "pe";
  const navHref = (base: string) => `${base}?country=${country}`;

  const handleLogout = () => {
    document.cookie =
      "condor_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Left: logo + nav */}
            <div className="flex items-center gap-4">
              <Link
                href={navHref("/admin")}
                className="flex items-center gap-2 text-sm font-bold text-foreground"
              >
                <Shield className="h-4 w-4 text-primary" />
                <span>CONDOR</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">
                  ADMIN
                </span>
              </Link>

              {/* Country switcher */}
              <CountrySwitcher />

              <nav className="hidden sm:flex items-center gap-1">
                {adminNav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" &&
                      pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={navHref(item.href)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/${country}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver sitio
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-rose hover:bg-rose/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-border px-4 py-2">
          <nav className="flex items-center gap-1">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={navHref(item.href)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex-1 justify-center",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show admin shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
