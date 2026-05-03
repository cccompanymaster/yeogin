import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { notify } from "@/lib/notify";

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
  const reason = String(f.get("rejectReason") || "").trim();

  const v = await db.snsVerification.findUnique({ where: { id } });
  if (!v) return NextResponse.redirect(new URL("/admin/sns", req.url));

  if (action === "approve") {
    const now = new Date();
    const userData: Record<string, unknown> = {};
    if (v.channel === "blog") {
      userData.blogUrl = v.url;
      userData.blogVisitors = v.metric;
      userData.blogVerifiedAt = now;
    } else if (v.channel === "insta") {
      userData.instaUrl = v.url;
      userData.instaFollowers = v.metric;
      userData.instaVerifiedAt = now;
    } else if (v.channel === "youtube") {
      userData.youtubeUrl = v.url;
      userData.youtubeSubscribers = v.metric;
      userData.youtubeVerifiedAt = now;
    } else if (v.channel === "tiktok") {
      userData.tiktokUrl = v.url;
      userData.tiktokFollowers = v.metric;
      userData.tiktokVerifiedAt = now;
    }
    await db.$transaction([
      db.snsVerification.update({
        where: { id },
        data: { status: "APPROVED", reviewedAt: now },
      }),
      db.user.update({ where: { id: v.userId }, data: userData }),
    ]);
    await notify({
      role: "USER",
      recipientId: v.userId,
      title: "SNS 인증이 완료되었어요 ✅",
      body: `제출하신 ${v.channel.toUpperCase()} 인증이 승인되었습니다.`,
      link: "/mypage",
    });
  } else if (action === "reject") {
    if (!reason) {
      const url = new URL("/admin/sns", req.url);
      url.searchParams.set("error", "반려 사유를 입력해주세요.");
      return NextResponse.redirect(url, 303);
    }
    await db.snsVerification.update({
      where: { id },
      data: { status: "REJECTED", rejectReason: reason, reviewedAt: new Date() },
    });
    await notify({
      role: "USER",
      recipientId: v.userId,
      title: "SNS 인증이 반려되었어요",
      body: `사유: ${reason}. 마이페이지에서 인증샷을 다시 등록할 수 있습니다.`,
      link: "/mypage",
    });
  }

  return NextResponse.redirect(new URL("/admin/sns", req.url));
}
