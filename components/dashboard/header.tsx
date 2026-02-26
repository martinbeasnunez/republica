"use client";

import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

export function Header({
  onMobileMenuClick,
}: {
  onMobileMenuClick?: () => void;
}) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-3 sm:px-6 gap-2">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuClick}
          className="lg:hidden flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>

        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex min-w-0 flex-1 sm:flex-initial items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="truncate hidden sm:inline">Pregúntale a CONDOR AI...</span>
          <span className="truncate sm:hidden">CONDOR AI...</span>
          <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Live indicator — hidden on mobile */}
          <div className="mr-1 hidden md:flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald" />
            <span className="text-xs font-medium text-emerald">
              Datos en vivo
            </span>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
