import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Vercel/서버리스 환경: 파일시스템이 읽기전용이라 /tmp로 dev.db를 복사
function ensureDbFile() {
  if (!process.env.VERCEL && process.env.NODE_ENV !== "production") return;

  const tmpPath = "/tmp/dev.db";
  const srcPath = path.join(process.cwd(), "prisma", "dev.db");

  // 이미 /tmp에 있으면 스킵 (한 인스턴스 안에서는 재사용)
  if (!fs.existsSync(tmpPath) && fs.existsSync(srcPath)) {
    try {
      fs.copyFileSync(srcPath, tmpPath);
    } catch (e) {
      console.error("[db] failed to copy dev.db to /tmp:", e);
    }
  }

  // PrismaClient 생성 전에 환경변수 갱신
  if (fs.existsSync(tmpPath)) {
    process.env.DATABASE_URL = `file:${tmpPath}`;
  }
}

ensureDbFile();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
