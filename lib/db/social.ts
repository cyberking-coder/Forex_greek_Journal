import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

export function getSocialSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      leaderboardOptIn: true,
      publicShareToken: true,
      publicShareEnabled: true,
    },
  });
}

export function setLeaderboardOptIn(userId: string, optIn: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { leaderboardOptIn: optIn },
  });
}

export function setDisplayName(userId: string, displayName: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { displayName },
  });
}

function newToken(): string {
  return randomBytes(16).toString("hex");
}

/** Enables public sharing, creating a token if needed. Returns the token. */
export async function enablePublicShare(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicShareToken: true },
  });
  const token = existing?.publicShareToken ?? newToken();
  await prisma.user.update({
    where: { id: userId },
    data: { publicShareEnabled: true, publicShareToken: token },
  });
  return token;
}

export function disablePublicShare(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { publicShareEnabled: false },
  });
}

export async function regenerateShareToken(userId: string): Promise<string> {
  const token = newToken();
  await prisma.user.update({
    where: { id: userId },
    data: { publicShareToken: token },
  });
  return token;
}

/** Resolve a public share token to its user, only if sharing is enabled. */
export function getUserByShareToken(token: string) {
  return prisma.user.findFirst({
    where: { publicShareToken: token, publicShareEnabled: true },
  });
}
