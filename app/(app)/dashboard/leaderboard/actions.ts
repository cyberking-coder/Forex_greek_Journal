"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  setLeaderboardOptIn,
  setDisplayName,
  enablePublicShare,
  disablePublicShare,
  regenerateShareToken,
} from "@/lib/db/social";

export type SocialActionResult =
  | { ok: true; token?: string }
  | { ok: false; error: string };

export async function setOptInAction(
  optIn: boolean,
): Promise<SocialActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  await setLeaderboardOptIn(user.id, optIn);
  revalidatePath("/dashboard/leaderboard");
  return { ok: true };
}

export async function setDisplayNameAction(
  name: string,
): Promise<SocialActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const trimmed = name.trim().slice(0, 40);
  await setDisplayName(user.id, trimmed || null);
  revalidatePath("/dashboard/leaderboard");
  revalidatePath("/dashboard/share");
  return { ok: true };
}

export async function setPublicShareAction(
  enabled: boolean,
): Promise<SocialActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  if (enabled) {
    const token = await enablePublicShare(user.id);
    revalidatePath("/dashboard/share");
    return { ok: true, token };
  }
  await disablePublicShare(user.id);
  revalidatePath("/dashboard/share");
  return { ok: true };
}

export async function regenerateShareTokenAction(): Promise<SocialActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const token = await regenerateShareToken(user.id);
  revalidatePath("/dashboard/share");
  return { ok: true, token };
}
