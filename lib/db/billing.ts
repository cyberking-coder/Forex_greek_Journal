import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";

export function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function getUserByDodoCustomer(dodoCustomerId: string) {
  return prisma.user.findFirst({ where: { dodoCustomerId } });
}

export function setDodoCustomerId(userId: string, dodoCustomerId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { dodoCustomerId },
  });
}

export type BillingUpdate = {
  plan: Plan;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  planRenewsAt?: Date | null;
  dodoCustomerId?: string | null;
};

export function updateUserBilling(userId: string, data: BillingUpdate) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      plan: data.plan,
      subscriptionId: data.subscriptionId ?? undefined,
      subscriptionStatus: data.subscriptionStatus ?? undefined,
      planRenewsAt: data.planRenewsAt ?? undefined,
      ...(data.dodoCustomerId ? { dodoCustomerId: data.dodoCustomerId } : {}),
    },
  });
}
