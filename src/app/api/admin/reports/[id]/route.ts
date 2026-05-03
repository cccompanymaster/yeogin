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
  const adminNote = String(f.get("adminNote") || "").trim() || null;

  const next = action === "resolve" ? "RESOLVED" : action === "reject" ? "REJECTED" : null;
  if (!next) return NextResponse.redirect(new URL("/admin", req.url));

  await db.report.update({
    where: { id },
    data: { status: next, adminNote },
  });
  return NextResponse.redirect(new URL("/admin", req.url));
}
