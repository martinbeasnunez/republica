# CONDOR Redesign Plan — UI/UX Overhaul

## Benchmarks Reviewed
- **The Hill Election Tracker** (US): Modular cards, political color system (blue/red), Graphik font, generous whitespace, clear visual hierarchy
- **Europe Elects** (EU): Alegreya Sans font, yellow accent navigation, restrained palette, card shadows, country selector with flags
- **SANEF Elections Dashboard** (South Africa): Fira Sans + Playfair Display, hierarchical flow, modular data tools, strategic spacing

## Key Insights from Competitors
1. **Typography hierarchy is strict** — h1/h2/h3/body/small each have defined sizes, not ad-hoc
2. **Data-dense sections use generous whitespace** to breathe
3. **Countdown/election day is ALWAYS the hero element** — biggest, boldest, most prominent
4. **Cards have clear elevation levels** — primary cards are bigger/bolder, secondary are smaller
5. **Stat numbers use larger fonts than labels** — clear visual distinction between data and metadata

---

## Changes Organized by Area

### 1. NEWS PAGE HERO (`news-hero-insight.tsx`)

**Countdown redesign:**
- Make countdown the dominant visual element — `text-7xl sm:text-8xl` (currently `text-5xl sm:text-6xl`)
- Add the label "FALTAN" above the number in small caps
- Add election date below: "12 de abril, 2026"
- Wider progress bar: `h-2` instead of `h-1.5`, `max-w-[160px]` instead of `max-w-[120px]`
- Add subtle background glow behind the number using urgency color at low opacity

**Title section:**
- "Briefing Electoral" → bigger: `text-xl sm:text-2xl` (currently `text-lg sm:text-xl`)
- Remove "ÚLTIMO ANÁLISIS DISPONIBLE" label — redundant with the status indicator
- Status indicator: make it a proper pill badge, not floating text. Use `rounded-full px-2.5 py-1 bg-emerald/10 border border-emerald/20` when active

**Stat pills:**
- Slightly bigger: `py-2 px-3` instead of `py-1.5 px-2.5`
- Numbers `text-sm` instead of `text-xs`
- Add "de" between number and label for readability: "743 noticias de 16 fuentes" → split into proper pills

**Race snapshot (Carrera Electoral):**
- Move to ZONE 1 alongside countdown, not below it
- Progress bars slightly thicker: `h-2.5` instead of `h-2`
- Candidate names: `text-sm` consistently (remove `text-xs sm:text-sm` pattern)
- Poll percentages: `text-base font-bold` instead of `text-sm font-bold`

**Secondary cards (Última noticia + Radar):**
- Increase padding: `p-4 sm:p-5` (currently `p-3 sm:p-4`)
- Card headers: `text-xs` instead of `text-[10px]`
- Article title: `text-sm` instead of `text-xs`
- Summary text: `text-xs` instead of `text-[11px]`

**Remove duplicate/confusing labels:**
- Remove `classification-header` strip entirely — it adds visual noise without value. The "CONDOR // BRIEFING ELECTORAL // AI-ANALYZED" is cosplay, not useful info
- Remove `grid-overlay` and `data-stream` background effects — they add visual clutter for no functional benefit

### 2. DASHBOARD HOME (`home-client.tsx`)

**HeroBriefing:**
- Same countdown treatment as news page (bigger, bolder, dominant)
- Same classification-header removal
- Same background effects removal
- Same stat pill sizing improvements

**"¿Quién va ganando?" section:**
- Title: `text-xl font-bold` instead of `text-lg font-extrabold`
- Subtitle: `text-sm` instead of `text-xs`
- Candidate photo circles: `h-12 w-12` instead of `h-10 w-10`
- Poll percentages: `text-base` instead of `text-sm`
- Progress bars: `h-3` instead of `h-2.5`
- Party name: `text-xs` instead of `text-[11px]`

**"Conócelos en 30 segundos" section:**
- Title: `text-xl font-bold` instead of `text-lg font-extrabold`
- Card width: `w-64` instead of `w-56` (more breathing room)
- Name: `text-base` instead of `text-sm`
- Party: `text-xs` instead of `text-[11px]`

**"¿Qué pasó hoy?" section:**
- Rename to "Últimas noticias" (doesn't lie about "today")
- Title: `text-xl font-bold`
- Article titles: `text-base` instead of `text-sm`
- Source/time: `text-xs` instead of `text-[11px]`

**Quiz CTA:**
- Keep as is — already good design

### 3. PLANES PAGE (`planes-client.tsx`)

**PDF Download fix:**
- Change "Plan oficial (JNE)" button from `<a>` wrapping a `<Button>` to just `<a>` with button styling
- For candidates WITH a `planUrl` that ends in `.pdf`: open in new tab (already works for some)
- For candidates WITHOUT a specific `planUrl`: link to JNE/CNE search page
- Add text "(PDF)" or "(Buscar)" to clarify what happens on click

**Plan source trust indicator:**
- Already has the emerald banner with ShieldCheck — keep it
- Add the specific plan URL source as text under each candidate card header

**AI Summary improvements:**
- When "Resumen IA" is clicked, show a ~300 character executive summary first (above the detailed analysis)
- Add a "Fuente: Plan de Gobierno registrado ante el JNE/CNE" note
- Make the summary clearly indicate it comes from the official document

**Card design improvements:**
- Candidate name: `text-base font-semibold` instead of `text-sm`
- Party name: `text-xs` instead of `text-[11px]`
- Proposal cards: `p-4` instead of `p-3`, title `text-sm` instead of `text-xs`
- Proposal summary: `text-xs` instead of `text-[11px]`

### 4. GLOBAL TYPOGRAPHY SCALE

Standardize across ALL components:
- **Page titles (h1):** `text-2xl sm:text-3xl font-bold`
- **Section titles (h2):** `text-xl font-bold`
- **Card titles (h3):** `text-base font-semibold`
- **Body text:** `text-sm`
- **Small/metadata:** `text-xs`
- **Micro labels:** `text-[10px]` (only for classification headers and timestamps)

Replace all `text-[11px]` with `text-xs` (12px) — 11px is too small and inconsistent.
Replace all `text-[9px]` and `text-[8px]` with `text-[10px]` minimum.
Replace all `text-[10px]` body text with `text-xs`.

### 5. GLOBAL SPACING

- Card padding: minimum `p-4` on mobile, `p-5 sm:p-6` on desktop
- Section gaps: consistent `space-y-8` between major sections
- Inner card gaps: `space-y-3` minimum

### 6. ICON SIZING

Standardize:
- **Large (hero/section icons):** `h-5 w-5`
- **Medium (card header icons):** `h-4 w-4`
- **Small (inline/metadata):** `h-3.5 w-3.5`
- Remove all `h-3 w-3` and `h-2.5 w-2.5` icon usage (too small)

---

## Files to Modify

1. `components/noticias/news-hero-insight.tsx` — News page hero redesign
2. `app/[country]/(dashboard)/home-client.tsx` — Dashboard hero + sections redesign
3. `app/[country]/(dashboard)/planes/planes-client.tsx` — Planes page fixes + design
4. `app/globals.css` — Remove unused utility classes (grid-overlay, data-stream, classification-header)

## What We're NOT Changing
- Color palette (maroon/cream works well)
- Font families (Inter + JetBrains Mono is solid)
- Overall layout structure (sidebar + main content)
- Framer Motion animations (keep them, they're good)
- shadcn/ui component base

## Summary
The core changes are: **bigger typography, more whitespace, prominent countdown, remove visual noise (classification headers, grid overlays), fix planes PDF links, standardize sizing across all components.** The goal is to look more like The Hill/Europe Elects (clean, editorial, data-focused) and less like a classified military terminal.
