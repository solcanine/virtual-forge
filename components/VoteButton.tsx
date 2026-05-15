"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { voteAction } from "@/app/actions";
import type { VoteActionResult } from "@/app/actions";

type Props = {
  launchId: string;
  initialCount: number;
};

export function VoteButton({ launchId, initialCount }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [hint, setHint] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setHint(null);
          start(async () => {
            const result: VoteActionResult = await voteAction(launchId);
            if (!result.ok && result.reason === "rate_limited") {
              setHint(result.message);
              return;
            }
            if (!result.ok && result.reason === "already_voted") {
              setHint("You already upvoted this launch.");
              return;
            }
            if (!result.ok && result.reason === "not_found") {
              setHint("That launch no longer exists.");
              return;
            }
            router.refresh();
          });
        }}
        className="flex min-w-[3.25rem] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-2 py-2 text-xs font-semibold text-forge-500 transition hover:border-forge-600/50 hover:bg-zinc-900 disabled:opacity-60"
        aria-label="Upvote this launch"
      >
        <span className="text-lg leading-none">▲</span>
        <span className="mt-1 tabular-nums text-zinc-200">{initialCount}</span>
      </button>
      {hint ? (
        <p className="max-w-[10rem] text-center text-[10px] leading-snug text-amber-400/90">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
