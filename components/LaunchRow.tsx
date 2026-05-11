import Link from "next/link";
import { CategoryPill } from "./CategoryPill";
import { VoteButton } from "./VoteButton";
import type { Launch } from "@/lib/types";

export function LaunchRow({ launch, rank }: { launch: Launch; rank: number }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-sm shadow-black/20 backdrop-blur-sm transition hover:border-zinc-700">
      <div className="hidden w-8 shrink-0 pt-1 text-right text-sm tabular-nums text-zinc-500 sm:block">
        {rank}
      </div>
      <VoteButton launchId={launch.id} initialCount={launch.voteCount} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/launch/${launch.id}`}
            className="truncate text-base font-semibold text-white hover:text-forge-400"
          >
            {launch.title}
          </Link>
          <CategoryPill category={launch.category} />
        </div>
        <p className="mt-1 text-sm text-zinc-400">{launch.tagline}</p>
        <p className="mt-2 text-xs text-zinc-500">
          by <span className="text-zinc-400">{launch.builder}</span>
        </p>
      </div>
    </article>
  );
}
