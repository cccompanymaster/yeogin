import { db } from "@/lib/db";

type NotifyInput = {
  role: "USER" | "ADVERTISER";
  recipientId: string;
  title: string;
  body: string;
  link?: string;
};

export async function notify(input: NotifyInput) {
  return db.notification.create({ data: { ...input } });
}

export async function notifyMany(inputs: NotifyInput[]) {
  if (inputs.length === 0) return;
  await db.notification.createMany({ data: inputs });
}
