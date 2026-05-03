export default function CommunityPage() {
  const posts = [
    {
      title: "강남맛집 체험단 첫 당첨 후기 (블로거 3개월 차)",
      tag: "후기",
      author: "별빛블로거",
      time: "2시간 전",
      replies: 12,
    },
    {
      title: "방문형 체험 시 이런 매장은 거르세요",
      tag: "정보",
      author: "리뷰장인",
      time: "5시간 전",
      replies: 34,
    },
    {
      title: "신청자 어필 메시지 잘 쓰는 법",
      tag: "꿀팁",
      author: "여긴매니저",
      time: "1일 전",
      replies: 56,
    },
    {
      title: "배송형 인증샷, 이 각도가 정답입니다",
      tag: "꿀팁",
      author: "포토리뷰",
      time: "2일 전",
      replies: 21,
    },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        <p className="mt-1 text-sm text-ink-500">
          체험단 노하우를 함께 나눠요. 좋은 매장을 추천하고, 안 좋은 경험은 공유하세요.
        </p>
      </div>
      <div className="card divide-y divide-ink-100">
        {posts.map((p) => (
          <div key={p.title} className="flex items-center justify-between p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="badge bg-brand-50 text-brand-700">{p.tag}</span>
                <span className="line-clamp-1 text-sm font-bold">{p.title}</span>
              </div>
              <div className="mt-1 text-[11px] text-ink-500">
                {p.author} · {p.time} · 댓글 {p.replies}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6 text-center text-sm text-ink-500">
        커뮤니티 작성 기능은 곧 오픈됩니다 ✨
      </div>
    </div>
  );
}
