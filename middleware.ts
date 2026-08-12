import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Project sunset: CONDOR ya no está en operación.
// Todo el sitio redirige al post mortem. No se cargan páginas de
// país ni se consultan datos (Supabase/OpenAI), así que el sitio
// deja de consumir recursos.
//
// Excepción: /admin se mantiene accesible (con su auth) para poder
// consultar/exportar datos antes de dar de baja los servicios.
//
// Se usa un redirect temporal (307) a propósito: es reversible y no
// queda cacheado de forma permanente por los navegadores, por si el
// proyecto se reactiva en el futuro.
// ─────────────────────────────────────────────────────────────

const POST_MORTEM_URL =
  "https://martinbeasnunez.co/condor-inteligencia-electoral-ia";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin: preservar acceso al panel (mantiene su auth) ──
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const session = req.cookies.get("condor_admin_session")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!session || session !== secret) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── Todo lo demás → post mortem ──
  return NextResponse.redirect(POST_MORTEM_URL, 307);
}

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto archivos estáticos, api y _next.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
