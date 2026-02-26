import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/api/cron/", "/api/setup/"],
      },
    ],
    sitemap: "https://condorperu.vercel.app/sitemap.xml",
  };
}
