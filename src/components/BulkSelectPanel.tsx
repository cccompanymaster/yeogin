"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenaltyMenu } from "@/components/PenaltyMenu";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  SELECTED: "선정",
  REJECTED: "미선정",
  COMPLETED: "완료",
};
const TRUST_LABEL: Record<string, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  DIAMOND: "Diamond",
};

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(
    dt.getDate()
  ).padStart(2, "0")}`;
};

export type ApplicantItem = {
  id: string;
  status: string;
  channelUrl: string;
  message: string | null;
  createdAt: string;
  user: { nickname: string; email: string; trustGrade: string };
  review: {
    id: string;
    url: string;
    status: string;
  } | null;
};

export function BulkApplicantList({
  campaignId,
  applicants,
}: {
  campaignId: string;
  applicants: ApplicantItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const pendingApps = applicants.filter((a) => a.status === "PENDING");
  const allChecked =
    pendingApps.length > 0 && pendingApps.every((a) => checked.has(a.id));

  const toggleAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(pendingApps.map((a) => a.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const submit = (action: "select" | "reject") => {
    if (checked.size === 0) return;
    if (
      !confirm(
        `선택한 ${checked.size}명을 ${
          action === "select" ? "선정" : "미선정"
        } 처리하시겠어요?`
      )
    )
      return;
    startTransition(async () => {
      await fetch("/api/advertiser/applications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(checked), action, campaignId }),
      });
      setChecked(new Set());
      router.refresh();
    });
  };

  return (
    <>
      {pendingApps.length > 0 && (
        <div className="card sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 p-3 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="h-4 w-4"
            />
            대기중 전체 선택 ({checked.size}/{pendingApps.length})
          </label>
          <div className="flex gap-2">
            <button
              disabled={checked.size === 0 || pending}
              onClick={() => submit("select")}
              className="btn-primary py-1.5"
            >
              선택 선정 ({checked.size})
            </button>
            <button
              disabled={checked.size === 0 || pending}
              onClick={() => submit("reject")}
              className="btn-outline py-1.5"
            >
              선택 미선정
            </button>
          </div>
        </div>
      )}

      <div className="card divide-y divide-ink-100">
        {applicants.map((a) => (
          <div key={a.id} className="flex items-start gap-4 p-4">
            {a.status === "PENDING" && (
              <input
                type="checkbox"
                className="mt-1.5 h-4 w-4"
                checked={checked.has(a.id)}
                onChange={() => toggle(a.id)}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{a.user.nickname}</span>
                <span className="badge bg-ink-100 text-ink-700">
                  {TRUST_LABEL[a.user.trustGrade]}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-ink-500">
                {a.user.email} · 신청일 {fmtDate(a.createdAt)}
              </div>
              <a
                href={a.channelUrl}
                target="_blank"
                className="mt-1 line-clamp-1 block text-xs text-brand-600 hover:underline"
              >
                {a.channelUrl}
              </a>
              {a.message && (
                <p className="mt-2 line-clamp-3 rounded-md bg-ink-50 p-2 text-xs text-ink-700">
                  {a.message}
                </p>
              )}
              {a.review && (
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="badge bg-emerald-50 text-emerald-700">
                    리뷰 등록됨
                  </span>
                  <a
                    href={a.review.url}
                    target="_blank"
                    className="text-brand-600 hover:underline"
                  >
                    {a.review.url}
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`badge ${
                  a.status === "SELECTED"
                    ? "bg-emerald-500 text-white"
                    : a.status === "REJECTED"
                      ? "bg-ink-200 text-ink-500"
                      : a.status === "COMPLETED"
                        ? "bg-blue-500 text-white"
                        : "bg-ink-100 text-ink-700"
                }`}
              >
                {STATUS_LABEL[a.status]}
              </span>
              {a.status === "PENDING" && (
                <div className="flex gap-1">
                  <form
                    action={`/api/advertiser/applications/${a.id}`}
                    method="post"
                  >
                    <input type="hidden" name="action" value="select" />
                    <button className="badge bg-emerald-500 text-white hover:bg-emerald-600">
                      선정
                    </button>
                  </form>
                  <form
                    action={`/api/advertiser/applications/${a.id}`}
                    method="post"
                  >
                    <input type="hidden" name="action" value="reject" />
                    <button className="badge bg-ink-200 text-ink-700 hover:bg-ink-300">
                      미선정
                    </button>
                  </form>
                </div>
              )}
              {a.review && a.review.status === "PENDING" && (
                <form
                  action={`/api/advertiser/reviews/${a.review.id}`}
                  method="post"
                >
                  <input type="hidden" name="action" value="approve" />
                  <button className="badge bg-blue-500 text-white">
                    검수승인
                  </button>
                </form>
              )}
              {(a.status === "SELECTED" || a.status === "COMPLETED") && (
                <PenaltyMenu applicationId={a.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
