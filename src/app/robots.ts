import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL || "https://yeogin.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/advertiser/dashboard", "/mypage"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
