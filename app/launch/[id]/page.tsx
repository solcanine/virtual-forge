import Link from "next/link";
import { notFound } from "next/navigation";
import { getLaunch } from "@/lib/store";
import { CategoryPill } from "@/components/CategoryPill";
import { VoteButton } from "@/components/VoteButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function LaunchDetailPage({ params }: Props) {
  const { id } = await params;
  const launch = await getLaunch(id);
  if (!launch) notFound();

  const created = new Date(launch.createdAt);

  return (
    <article className="space-y-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-forge-400"
      >
        ← Back to today
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <VoteButton launchId={launch.id} initialCount={launch.voteCount} />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {launch.title}
            </h1>
            <CategoryPill category={launch.category} />
          </div>
          <p className="text-lg text-zinc-300">{launch.tagline}</p>
          <p className="text-sm text-zinc-500">
            Shipped by{" "}
            <span className="text-zinc-300">{launch.builder}</span>
            <span className="mx-2 text-zinc-600">·</span>
            <time dateTime={launch.createdAt}>
              {created.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </p>
          <a
            href={launch.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-forge-500 hover:text-forge-400"
          >
            Visit project
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          About this launch
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {launch.description}
        </p>
      </div>
    </article>
  );
}
