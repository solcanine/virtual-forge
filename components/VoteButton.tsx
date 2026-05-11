"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { voteAction } from "@/app/actions";

type Props = {
  launchId: string;
  initialCount: number;
};

export function VoteButton({ launchId, initialCount }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await voteAction(launchId);
          router.refresh();
        });
      }}
      className="flex min-w-[3.25rem] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-2 py-2 text-xs font-semibold text-forge-500 transition hover:border-forge-600/50 hover:bg-zinc-900 disabled:opacity-60"
      aria-label="Upvote this launch"
    >
      <span className="text-lg leading-none">▲</span>
      <span className="mt-1 tabular-nums text-zinc-200">{initialCount}</span>
    </button>
  );
}
