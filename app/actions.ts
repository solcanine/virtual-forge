"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLaunch, voteLaunch } from "@/lib/store";
import { getVoterId } from "@/lib/voter";
import type { LaunchCategory } from "@/lib/types";

export async function voteAction(launchId: string) {
  const voterId = await getVoterId();
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
  const title = String(formData.get("title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
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
  if (!/^https?:\/\//i.test(url)) {
    return { error: "URL must start with http:// or https://" };
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
