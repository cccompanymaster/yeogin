/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  // Vercel 서버리스 함수 번들에 SQLite 시드 파일 포함
  outputFileTracingIncludes: {
    "/**/*": ["./prisma/dev.db"],
  },
};
export default nextConfig;
