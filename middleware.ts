import { NextRequest, NextResponse } from "next/server";

const VALID_COUNTRIES = ["pe", "co"];
const DEFAULT_COUNTRY = "pe";

// Legacy routes that existed before multi-country (no country prefix)
const DASHBOARD_ROUTES = [
  "candidatos",
  "encuestas",
  "noticias",
  "actualizaciones",
  "quiz",
  "planes",
  "verificador",
  "pilares",
  "radiografia",
  "simulador",
  "mapa",
  "en-vivo",
  "metodologia",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin auth (keep existing logic) ──
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.cookies.get("condor_admin_session")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!session || session !== secret) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Root "/" → redirect to default country ──
  if (pathname === "/") {
    const url = new URL(`/${DEFAULT_COUNTRY}`, req.url);
    return NextResponse.redirect(url);
  }

  // ── Legacy routes without country prefix → redirect to /pe/... ──
  const firstSegment = pathname.split("/")[1];
  if (DASHBOARD_ROUTES.includes(firstSegment)) {
    const url = new URL(`/${DEFAULT_COUNTRY}${pathname}`, req.url);
    return NextResponse.redirect(url, 308); // Permanent redirect
  }

  // ── Validate country prefix ──
  if (VALID_COUNTRIES.includes(firstSegment)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, api, _next
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
