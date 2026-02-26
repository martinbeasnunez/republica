import { NextRequest, NextResponse } from "next/server";

const VALID_COUNTRIES = ["pe", "co"];
const DEFAULT_COUNTRY = "pe";

// Legacy routes that existed before multi-country (no country prefix)
const DASHBOARD_ROUTES = [
  "candidatos",
  "encuestas",
  "noticias",
  "actualizaciones",
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
  const host = req.headers.get("host") || "";

  // ── Legacy domain redirect: condorperu.vercel.app → condorlatam.com ──
  if (host.includes("condorperu")) {
    return NextResponse.redirect(
      new URL(pathname, "https://condorlatam.com"),
      301
    );
  }

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

  // ── Root "/" → geo-detection + cookie-based routing ──
  if (pathname === "/") {
    // Allow ?select=true to force showing the country selector
    if (req.nextUrl.searchParams.get("select") === "true") {
      return NextResponse.next();
    }

    // 1. Check cookie preference (user already chose a country)
    const cookieCountry = req.cookies.get("condor_country")?.value?.toLowerCase();
    if (cookieCountry && VALID_COUNTRIES.includes(cookieCountry)) {
      return NextResponse.redirect(new URL(`/${cookieCountry}`, req.url));
    }

    // 2. Check Vercel geo-detection header
    const geoCountry = req.headers.get("x-vercel-ip-country")?.toLowerCase();
    if (geoCountry && VALID_COUNTRIES.includes(geoCountry)) {
      const response = NextResponse.redirect(new URL(`/${geoCountry}`, req.url));
      response.cookies.set("condor_country", geoCountry, {
        maxAge: 31536000, // 1 year
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    // 3. Unknown country → show landing page (app/page.tsx)
    return NextResponse.next();
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
