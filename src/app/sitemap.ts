import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE = process.env.SITE_URL || "https://yeogin.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    "",
    "/campaigns",
    "/reviews",
    "/community",
    "/login",
    "/signup",
    "/terms",
    "/privacy",
    "/advertiser",
  ].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  // 진행중 캠페인 상세
  let campaignUrls: MetadataRoute.Sitemap = [];
  try {
    const list = await db.campaign.findMany({
      where: { status: "OPEN" },
      select: { id: true, createdAt: true },
      take: 1000,
    });
    campaignUrls = list.map((c) => ({
      url: `${SITE}/campaigns/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // DB 미준비 시 무시
  }

  return [...staticUrls, ...campaignUrls];
}
