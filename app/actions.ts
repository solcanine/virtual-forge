"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLaunch, voteLaunch } from "@/lib/store";
import {
  RateLimitError,
  consumeRateLimit,
  hourWindowSlot,
  minuteWindowSlot,
} from "@/lib/rate-limit";
import { assertHttpUrl } from "@/lib/url";
import { getVoterId } from "@/lib/voter";
import type { LaunchCategory } from "@/lib/types";

export type VoteActionResult =
  | { ok: true; voteCount: number }
  | { ok: false; reason: "already_voted"; voteCount: number }
  | { ok: false; reason: "not_found"; voteCount: number }
  | { ok: false; reason: "rate_limited"; message: string };

export async function voteAction(launchId: string): Promise<VoteActionResult> {
  const voterId = await getVoterId();
  try {
    await consumeRateLimit({
      scope: "vote_per_minute",
      actorId: voterId,
      windowSlot: minuteWindowSlot(),
      limit: 40,
      errorMessage: "You are voting too quickly. Try again in about a minute.",
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return {
        ok: false,
        reason: "rate_limited",
        message: e.message,
      };
    }
    throw e;
  }

  const result = await voteLaunch(launchId, voterId);
  revalidatePath("/");
  revalidatePath(`/launch/${launchId}`);
  return result;
}

export type SubmitState = { error: string } | null;

export async function submitLaunchAction(
  _prev: SubmitState | null,
  formData: FormData,
): Promise<SubmitState> {
  const voterId = await getVoterId();

  try {
    await consumeRateLimit({
      scope: "submit_per_hour",
      actorId: voterId,
      windowSlot: hourWindowSlot(),
      limit: 12,
      errorMessage:
        "Too many submissions from this browser in the last hour. Try again later.",
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { error: e.message };
    }
    throw e;
  }

  const title = String(formData.get("title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  let url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "") as LaunchCategory;
  const builder = String(formData.get("builder") ?? "").trim();

  const allowed: LaunchCategory[] = [
    "agent",
    "sdk",
    "infra",
    "template",
    "tooling",
  ];
  if (!allowed.includes(category)) {
    return { error: "Pick a valid category." };
  }
  if (title.length < 3 || title.length > 80) {
    return { error: "Title should be 3–80 characters." };
  }
  if (tagline.length < 8 || tagline.length > 140) {
    return { error: "Tagline should be 8–140 characters." };
  }
  try {
    url = assertHttpUrl(url);
  } catch {
    return { error: "URL must be a valid http:// or https:// link" };
  }
  if (description.length < 20 || description.length > 2000) {
    return {
      error: "Description should be 20–2000 characters.",
    };
  }
  if (builder.length < 2 || builder.length > 60) {
    return { error: "Builder name should be 2–60 characters." };
  }

  const launch = await createLaunch({
    title,
    tagline,
    url,
    description,
    category,
    builder,
  });
  revalidatePath("/");
  redirect(`/launch/${launch.id}`);
}
