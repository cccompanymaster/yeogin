import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const { id } = await params;
  const f = await req.formData();
  const action = String(f.get("action") || "");

  if (action === "delete") {
    await db.notice.delete({ where: { id } }).catch(() => {});
  }
  return NextResponse.redirect(new URL("/admin/notices", req.url));
}
