import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const IMG = (q: string) =>
  `https://images.unsplash.com/${q}?w=800&q=80&auto=format&fit=crop`;

const sampleImages = {
  food: IMG("photo-1546069901-ba9599a7e63c"),
  pasta: IMG("photo-1551183053-bf91a1d81141"),
  cafe: IMG("photo-1497636577773-f1231844b336"),
  beauty: IMG("photo-1522335789203-aaa2f6f0e0fb"),
  fashion: IMG("photo-1490481651871-ab68de25d43d"),
  travel: IMG("photo-1507525428034-b723cf961d3e"),
  digital: IMG("photo-1593642632559-0c6d3fc62b89"),
  baby: IMG("photo-1519689680058-324335c77eba"),
  health: IMG("photo-1490645935967-10de6ba17061"),
  home: IMG("photo-1556909114-f6e7ad7d3136"),
  steak: IMG("photo-1544025162-d76694265947"),
  burger: IMG("photo-1568901346375-23c9450c58cd"),
  sushi: IMG("photo-1579871494447-9811cf80d66c"),
  dessert: IMG("photo-1551024601-bec78aea704b"),
  bbq: IMG("photo-1529193591184-b1d58069ecdd"),
  coffee: IMG("photo-1495474472287-4d71bcdd2085"),
};

function plus(days: number) {
  return new Date(Date.now() + days * 86400000);
}

async function main() {
  console.log("🌱 Seeding...");

  // 기존 데이터 정리
  await db.advertiserPointHistory.deleteMany();
  await db.pointHistory.deleteMany();
  await db.report.deleteMany();
  await db.notification.deleteMany();
  await db.penalty.deleteMany();
  await db.snsVerification.deleteMany();
  await db.favorite.deleteMany();
  await db.review.deleteMany();
  await db.application.deleteMany();
  await db.campaign.deleteMany();
  await db.user.deleteMany();
  await db.advertiser.deleteMany();

  // 데모 사용자
  const demoUser = await db.user.create({
    data: {
      email: "demo@yeogin.kr",
      passwordHash: await bcrypt.hash("demo1234", 10),
      nickname: "여긴데모",
      blogUrl: "https://blog.naver.com/yeogin_demo",
      instaUrl: "https://instagram.com/yeogin_demo",
      region: "서울 강남구",
      trustGrade: "GOLD",
      point: 24500,
      blogVisitors: 8763,
      blogVerifiedAt: new Date(),
      instaFollowers: 95000,
      instaVerifiedAt: new Date(),
      attendStreak: 5,
      lastAttendAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      referralCode: "YEOGIN-DEMO",
    },
  });

  // 추가 사용자 (신청자 시드)
  const users = await Promise.all(
    [
      ["star", "별빛블로거", "BRONZE"],
      ["pro", "리뷰장인", "PLATINUM"],
      ["foodie", "맛집헌터", "GOLD"],
      ["photo", "포토리뷰", "SILVER"],
      ["new", "신입블로거", "BRONZE"],
    ].map(async ([id, name, grade]) =>
      db.user.create({
        data: {
          email: `${id}@yeogin.kr`,
          passwordHash: await bcrypt.hash("test1234", 10),
          nickname: name as string,
          blogUrl: `https://blog.naver.com/${id}`,
          trustGrade: grade as string,
        },
      })
    )
  );

  // 광고주들
  const adv1 = await db.advertiser.create({
    data: {
      email: "biz@yeogin.kr",
      passwordHash: await bcrypt.hash("biz1234", 10),
      companyName: "(주)강남파스타하우스",
      bizNumber: "123-45-67890",
      contactName: "김사장",
      phone: "010-1234-5678",
      point: 200000,
    },
  });
  const adv2 = await db.advertiser.create({
    data: {
      email: "cafe@yeogin.kr",
      passwordHash: await bcrypt.hash("biz1234", 10),
      companyName: "달콤한카페",
      bizNumber: "234-56-78901",
      contactName: "박대표",
      phone: "010-2345-6789",
      point: 80000,
    },
  });
  const adv3 = await db.advertiser.create({
    data: {
      email: "beauty@yeogin.kr",
      passwordHash: await bcrypt.hash("biz1234", 10),
      companyName: "글로우뷰티",
      bizNumber: "345-67-89012",
      contactName: "이팀장",
      phone: "010-3456-7890",
      point: 150000,
    },
  });

  // 광고주 충전 시드 내역
  await db.advertiserPointHistory.createMany({
    data: [
      { advertiserId: adv1.id, delta: 100000, reason: "CHARGE", balance: 100000, note: "최초 충전" },
      { advertiserId: adv1.id, delta: 100000, reason: "CHARGE", balance: 200000, note: "추가 충전" },
      { advertiserId: adv2.id, delta: 80000, reason: "CHARGE", balance: 80000, note: "최초 충전" },
      { advertiserId: adv3.id, delta: 150000, reason: "CHARGE", balance: 150000, note: "최초 충전" },
    ],
  });

  // 캠페인 데이터
  const campaigns: Array<Parameters<typeof db.campaign.create>[0]["data"]> = [
    {
      advertiserId: adv1.id,
      title: "강남역 신상 이탈리안 파스타 코스 체험단",
      description:
        "오픈 1주년 기념 시그니처 파스타 4종 + 디저트 1종 + 음료를 무료로 체험해보세요. 와인페어링도 가능합니다.\n\n쾌적한 인테리어와 정성스러운 플레이팅으로 데이트 코스로도 추천드려요.",
      thumbnail: sampleImages.pasta,
      type: "VISIT",
      channel: "BLOG",
      category: "맛집",
      region: "서울 강남구",
      address: "서울 강남구 테헤란로 123",
      offer: "2인 코스 (파스타·메인·디저트·음료)",
      offerValue: 110000,
      capacity: 6,
      appliedCount: 23,
      applyStart: plus(-2),
      applyEnd: plus(5),
      announceAt: plus(7),
      reviewStart: plus(8),
      reviewEnd: plus(22),
      guide:
        "1. 매장 외관·내부·메뉴 사진 5장 이상 포함\n2. 1000자 이상 작성\n3. 필수 키워드 모두 포함\n4. 솔직한 후기 작성",
      keywords: "강남역맛집, 파스타맛집, 데이트코스",
      fastMatch: true,
    },
    {
      advertiserId: adv1.id,
      title: "압구정 프리미엄 스테이크 디너 체험",
      description:
        "USDA 프라임 등급 안심 스테이크와 와인 1잔을 즐기는 프리미엄 디너 코스. 분위기 좋은 룸 좌석 보장.",
      thumbnail: sampleImages.steak,
      type: "VISIT",
      channel: "INSTA",
      category: "맛집",
      region: "서울 강남구",
      address: "서울 강남구 압구정로 88",
      offer: "1인 디너 코스 + 와인 1잔",
      offerValue: 180000,
      capacity: 4,
      appliedCount: 47,
      applyStart: plus(-1),
      applyEnd: plus(3),
      announceAt: plus(5),
      reviewStart: plus(6),
      reviewEnd: plus(20),
      guide: "사진 8장 이상, 매장 분위기 위주로 촬영",
      keywords: "압구정맛집, 스테이크, 데이트",
    },
    {
      advertiserId: adv1.id,
      title: "마포 가성비 무한리필 삼겹살집",
      description:
        "프리미엄 1++ 한돈 삼겹살 무한리필. 직장인 회식 추천 매장.",
      thumbnail: sampleImages.bbq,
      type: "VISIT",
      channel: "BLOG",
      category: "맛집",
      region: "서울 마포구",
      address: "서울 마포구 동교동 12",
      offer: "2인 삼겹살 무한리필 + 음료",
      offerValue: 60000,
      capacity: 8,
      appliedCount: 15,
      applyStart: plus(0),
      applyEnd: plus(6),
      announceAt: plus(8),
      reviewStart: plus(9),
      reviewEnd: plus(23),
      guide: "회식 분위기 위주 촬영 권장",
      keywords: "마포맛집, 삼겹살, 회식장소",
    },
    {
      advertiserId: adv1.id,
      title: "성수동 핫플 수제버거 신메뉴 체험",
      description: "신메뉴 와규 버거 + 트러플 감자튀김 세트를 가장 먼저 만나보세요.",
      thumbnail: sampleImages.burger,
      type: "VISIT",
      channel: "INSTA",
      category: "맛집",
      region: "서울 강북구",
      offer: "와규 버거 세트 (음료 포함)",
      offerValue: 32000,
      capacity: 10,
      appliedCount: 88,
      applyStart: plus(-3),
      applyEnd: plus(2),
      announceAt: plus(4),
      reviewStart: plus(5),
      reviewEnd: plus(19),
      guide: "릴스 1개 + 피드 3장",
      keywords: "성수맛집, 수제버거, 신메뉴",
      fastMatch: true,
    },
    {
      advertiserId: adv2.id,
      title: "한남동 디저트 카페 시즌 케이크 체험",
      description: "딸기 시즌 한정 케이크 2종 + 시그니처 음료. 인스타 감성 보장.",
      thumbnail: sampleImages.dessert,
      type: "VISIT",
      channel: "INSTA",
      category: "카페",
      region: "서울 용산구",
      address: "서울 용산구 한남대로 50",
      offer: "케이크 2조각 + 음료 2잔",
      offerValue: 45000,
      capacity: 7,
      appliedCount: 31,
      applyStart: plus(-1),
      applyEnd: plus(4),
      announceAt: plus(6),
      reviewStart: plus(7),
      reviewEnd: plus(21),
      guide: "감성 사진 5장 이상, 매장 디자인 강조",
      keywords: "한남동카페, 디저트맛집, 케이크",
    },
    {
      advertiserId: adv2.id,
      title: "홍대 신상 스페셜티 커피 원두 체험",
      description: "에티오피아 예가체프 원두 200g 무료 제공. 핸드드립 또는 머신 모두 가능.",
      thumbnail: sampleImages.coffee,
      type: "DELIVERY",
      channel: "BLOG",
      category: "카페",
      offer: "스페셜티 원두 200g 1봉",
      offerValue: 28000,
      capacity: 20,
      appliedCount: 64,
      applyStart: plus(-2),
      applyEnd: plus(3),
      announceAt: plus(5),
      reviewStart: plus(7),
      reviewEnd: plus(21),
      guide: "테이스팅 노트 포함하여 작성",
      keywords: "스페셜티커피, 원두추천, 홍대카페",
    },
    {
      advertiserId: adv3.id,
      title: "신상 비건 화장품 토너+세럼 풀세트 배송",
      description: "민감성 피부도 안심하고 사용할 수 있는 비건 인증 스킨케어. 토너+세럼+크림 3종 세트.",
      thumbnail: sampleImages.beauty,
      type: "DELIVERY",
      channel: "INSTA",
      category: "뷰티",
      offer: "비건 스킨케어 3종 세트 (정가 89,000원)",
      offerValue: 89000,
      capacity: 15,
      appliedCount: 102,
      applyStart: plus(-2),
      applyEnd: plus(4),
      announceAt: plus(6),
      reviewStart: plus(8),
      reviewEnd: plus(22),
      guide: "사용 전후 사진, 텍스처 사진 포함",
      keywords: "비건화장품, 민감성스킨케어, 비건뷰티",
    },
    {
      advertiserId: adv3.id,
      title: "수분 폭탄 마스크팩 30매 배송형 체험",
      description: "히알루론산 5종 복합 함유 마스크팩 30매. 매일 사용 후기 부탁드려요.",
      thumbnail: sampleImages.beauty,
      type: "DELIVERY",
      channel: "BLOG",
      category: "뷰티",
      offer: "프리미엄 마스크팩 30매",
      offerValue: 60000,
      capacity: 25,
      appliedCount: 215,
      applyStart: plus(-5),
      applyEnd: plus(1),
      announceAt: plus(3),
      reviewStart: plus(5),
      reviewEnd: plus(25),
      guide: "10일 이상 사용 후기, 인증샷 5장",
      keywords: "마스크팩, 수분팩, 데일리스킨케어",
      fastMatch: true,
    },
    {
      advertiserId: adv3.id,
      title: "S/S 신상 원피스 패션 인스타 체험",
      description: "봄 신상 린넨 원피스 1벌 무료 제공. 사이즈 S/M/L 선택 가능.",
      thumbnail: sampleImages.fashion,
      type: "DELIVERY",
      channel: "INSTA",
      category: "패션",
      offer: "린넨 원피스 1벌",
      offerValue: 79000,
      capacity: 12,
      appliedCount: 56,
      applyStart: plus(-1),
      applyEnd: plus(5),
      announceAt: plus(7),
      reviewStart: plus(10),
      reviewEnd: plus(24),
      guide: "전신샷, 디테일샷 포함",
      keywords: "봄원피스, 데일리룩, 패션스타그램",
    },
    {
      advertiserId: adv3.id,
      title: "프리미엄 견과류 4종 선물세트",
      description: "아몬드·캐슈넛·호두·피칸 각 200g. 매일 한 줌으로 건강하게.",
      thumbnail: sampleImages.food,
      type: "DELIVERY",
      channel: "BLOG",
      category: "식품",
      offer: "견과류 4종 세트 (800g)",
      offerValue: 35000,
      capacity: 30,
      appliedCount: 134,
      applyStart: plus(-3),
      applyEnd: plus(2),
      announceAt: plus(4),
      reviewStart: plus(6),
      reviewEnd: plus(20),
      guide: "맛 평가, 식감 위주",
      keywords: "건강간식, 견과류, 다이어트간식",
    },
    {
      advertiserId: adv2.id,
      title: "제주 감귤청 1kg 배송형 체험",
      description: "제주 농가 직송 청 무첨가 감귤청. 따뜻한 물에 타먹기 좋아요.",
      thumbnail: sampleImages.food,
      type: "DELIVERY",
      channel: "BLOG",
      category: "식품",
      offer: "수제 감귤청 1kg",
      offerValue: 25000,
      capacity: 18,
      appliedCount: 41,
      applyStart: plus(-1),
      applyEnd: plus(7),
      announceAt: plus(9),
      reviewStart: plus(12),
      reviewEnd: plus(26),
      guide: "활용 레시피 1개 이상 포함",
      keywords: "감귤청, 수제청, 제주특산물",
    },
    {
      advertiserId: adv2.id,
      title: "스마트워치 신모델 출시 기자단",
      description: "신제품 사양·디자인·가격 정보를 정리해 작성해주실 분.",
      thumbnail: sampleImages.digital,
      type: "REPORTER",
      channel: "BLOG",
      category: "디지털",
      offer: "원고료 30,000원 + 신제품 정보 자료",
      offerValue: 30000,
      capacity: 20,
      appliedCount: 78,
      applyStart: plus(-1),
      applyEnd: plus(3),
      announceAt: plus(4),
      reviewStart: plus(5),
      reviewEnd: plus(15),
      guide: "보도자료 기반 1500자 이상",
      keywords: "스마트워치, 웨어러블, IT신제품",
    },
    {
      advertiserId: adv1.id,
      title: "강남 신축 호텔 패키지 1박 체험",
      description: "디럭스 더블룸 1박 + 조식 2인. 풀빌라 라운지 무료 이용.",
      thumbnail: sampleImages.travel,
      type: "VISIT",
      channel: "INSTA",
      category: "여행",
      region: "서울 강남구",
      address: "서울 강남구 영동대로 200",
      offer: "디럭스룸 1박 + 조식 2인",
      offerValue: 320000,
      capacity: 3,
      appliedCount: 198,
      applyStart: plus(-3),
      applyEnd: plus(2),
      announceAt: plus(4),
      reviewStart: plus(6),
      reviewEnd: plus(20),
      guide: "객실, 조식, 부대시설 사진 필수",
      keywords: "강남호텔, 호캉스, 럭셔리호텔",
      fastMatch: true,
    },
    {
      advertiserId: adv3.id,
      title: "유아용 친환경 물티슈 4팩 체험",
      description: "100% 천연펄프 베이비 물티슈. 안심하고 사용하세요.",
      thumbnail: sampleImages.baby,
      type: "DELIVERY",
      channel: "BLOG",
      category: "육아",
      offer: "베이비 물티슈 4팩 (320매)",
      offerValue: 22000,
      capacity: 22,
      appliedCount: 67,
      applyStart: plus(0),
      applyEnd: plus(6),
      announceAt: plus(8),
      reviewStart: plus(10),
      reviewEnd: plus(24),
      guide: "사용 인증샷 + 텍스처 비교",
      keywords: "베이비물티슈, 유아용품, 친환경육아",
    },
    {
      advertiserId: adv2.id,
      title: "프리미엄 디퓨저 200ml 체험",
      description: "5가지 향 중 선택 가능. 거실·침실에 어울리는 분위기 연출.",
      thumbnail: sampleImages.home,
      type: "DELIVERY",
      channel: "INSTA",
      category: "생활",
      offer: "프리미엄 디퓨저 200ml + 리드 8개",
      offerValue: 48000,
      capacity: 16,
      appliedCount: 39,
      applyStart: plus(-2),
      applyEnd: plus(5),
      announceAt: plus(7),
      reviewStart: plus(9),
      reviewEnd: plus(23),
      guide: "공간 사진 4장 이상, 향 표현",
      keywords: "디퓨저, 홈인테리어, 향기마케팅",
    },
    {
      advertiserId: adv3.id,
      title: "헬스 보충제 단백질 쉐이크 4kg 체험",
      description: "WPI 100% 분리유청 단백질. 입문자도 부드럽게 흡수.",
      thumbnail: sampleImages.health,
      type: "PURCHASE",
      channel: "BLOG",
      category: "식품",
      offer: "단백질 쉐이크 4kg (페이백)",
      offerValue: 89000,
      capacity: 10,
      appliedCount: 52,
      applyStart: plus(-1),
      applyEnd: plus(4),
      announceAt: plus(5),
      reviewStart: plus(6),
      reviewEnd: plus(20),
      guide: "구매 영수증 인증, 섭취 후기",
      keywords: "헬스보충제, 단백질쉐이크, 헬스타그램",
    },
  ];

  const created = [];
  for (const data of campaigns) {
    created.push(await db.campaign.create({ data }));
  }

  // 데모 사용자가 일부 캠페인에 신청·선정·완료된 상태 시드
  const c1 = created[0]; // PENDING
  await db.application.create({
    data: {
      campaignId: c1.id,
      userId: demoUser.id,
      channelUrl: demoUser.blogUrl!,
      message: "근처 거주자로 자주 매장 방문합니다. 사진과 글 모두 정성껏 작성하겠습니다.",
    },
  });

  const c2 = created[4]; // SELECTED
  await db.application.create({
    data: {
      campaignId: c2.id,
      userId: demoUser.id,
      channelUrl: demoUser.instaUrl!,
      status: "SELECTED",
    },
  });

  const c3 = created[7]; // SELECTED + REVIEW PENDING
  const app3 = await db.application.create({
    data: {
      campaignId: c3.id,
      userId: demoUser.id,
      channelUrl: demoUser.blogUrl!,
      status: "SELECTED",
    },
  });
  await db.review.create({
    data: {
      applicationId: app3.id,
      campaignId: c3.id,
      userId: demoUser.id,
      url: "https://blog.naver.com/yeogin_demo/2025/01/mask-pack-review",
      rating: 5,
      highlight: "수분 보충 미쳤어요. 다음 캠페인도 무조건 신청!",
    },
  });

  // 데모 승인 리뷰 (후기 갤러리 노출용)
  for (let i = 0; i < users.length && i < created.length - 6; i++) {
    const u = users[i];
    const camp = created[i + 6];
    const a = await db.application.create({
      data: {
        campaignId: camp.id,
        userId: u.id,
        channelUrl: u.blogUrl!,
        status: "COMPLETED",
      },
    });
    const samples = [
      "정말 만족스러웠어요. 사장님도 친절하셨고 메뉴도 다 훌륭해요!",
      "사진 찍기 좋은 분위기 + 가성비. 데이트 코스로 강추",
      "기대 이상이었습니다. 다음에도 또 가고 싶은 곳",
      "솔직히 광고인 줄 알았는데 진짜 맛있어서 깜짝 놀랐어요",
      "포장도 깔끔하고 사용감 너무 좋아요. 재구매 의사 100%",
    ];
    await db.review.create({
      data: {
        applicationId: a.id,
        campaignId: camp.id,
        userId: u.id,
        url: `${u.blogUrl}/review-${camp.id.slice(0, 6)}`,
        rating: 4 + (i % 2),
        highlight: samples[i % samples.length],
        status: "APPROVED",
      },
    });
  }

  // 다른 사용자들도 신청한 상태 시드 (광고주 화면용)
  for (const u of users) {
    await db.application.create({
      data: {
        campaignId: created[0].id,
        userId: u.id,
        channelUrl: u.blogUrl!,
        message: "매장 방문 가능합니다. 정성스러운 후기 약속드려요.",
      },
    });
  }

  // 데모 알림 시드
  await db.notification.createMany({
    data: [
      {
        role: "USER",
        recipientId: demoUser.id,
        title: "🎉 캠페인에 선정되었어요!",
        body: `${created[4].title} 캠페인에 선정되었습니다. 마이페이지에서 가이드를 확인하세요.`,
        link: "/mypage",
      },
      {
        role: "USER",
        recipientId: demoUser.id,
        title: "리뷰 검수 대기 중",
        body: `${created[7].title} 리뷰 검수가 진행 중입니다.`,
        link: "/mypage",
      },
      {
        role: "ADVERTISER",
        recipientId: adv1.id,
        title: "새 신청자가 도착했어요",
        body: `${created[0].title} 캠페인에 새 신청이 접수되었습니다.`,
        link: `/advertiser/campaigns/${created[0].id}/applicants`,
        read: false,
      },
    ],
  });

  // 신고 데모 시드
  await db.report.createMany({
    data: [
      {
        reporterUserId: users[0].id,
        campaignId: created[2].id,
        reason: "BAD_TREATMENT",
        detail: "방문 시 광고와 다른 메뉴로 응대받았습니다. 사진 자료가 있습니다.",
      },
      {
        reporterUserId: users[1].id,
        campaignId: created[5].id,
        reason: "FALSE_INFO",
        detail: "제공 내역에 적힌 원두 200g이 실제로는 100g만 배송되었어요.",
      },
    ],
  });

  console.log(
    `✅ Done. users=${users.length + 1}, advertisers=3, campaigns=${created.length}, reports=2`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
