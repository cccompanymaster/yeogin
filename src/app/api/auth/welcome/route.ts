import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const f = await req.formData();
  const interests = f.getAll("interests").map((v) => String(v)).slice(0, 5).join(",");
  const region = String(f.get("region") || "").trim() || null;
  const blogUrl = String(f.get("blogUrl") || "").trim() || null;
  const instaUrl = String(f.get("instaUrl") || "").trim() || null;
  const youtubeUrl = String(f.get("youtubeUrl") || "").trim() || null;

  await db.user.update({
    where: { id: session.id },
    data: { interests, region, blogUrl, instaUrl, youtubeUrl },
  });

  return NextResponse.redirect(new URL("/campaigns", req.url));
}
