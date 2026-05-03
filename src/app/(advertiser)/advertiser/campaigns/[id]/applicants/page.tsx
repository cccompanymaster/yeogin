import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { BulkApplicantList, type ApplicantItem } from "@/components/BulkSelectPanel";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      applications: {
        include: { user: true, review: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!campaign || campaign.advertiserId !== session.id) notFound();

  const items: ApplicantItem[] = campaign.applications.map((a) => ({
    id: a.id,
    status: a.status,
    channelUrl: a.channelUrl,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    user: {
      nickname: a.user.nickname,
      email: a.user.email,
      trustGrade: a.user.trustGrade,
    },
    review: a.review
      ? { id: a.review.id, url: a.review.url, status: a.review.status }
      : null,
  }));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/advertiser/campaigns" className="text-xs text-ink-500">
          ← 캠페인 목록
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{campaign.title}</h1>
        <div className="mt-1 text-sm text-ink-500">
          신청 {campaign.applications.length}명 / 모집 {campaign.capacity}명
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 신청자가 없습니다.
        </div>
      ) : (
        <BulkApplicantList campaignId={campaign.id} applicants={items} />
      )}
    </div>
  );
}
