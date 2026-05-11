import { listLaunchesSorted } from "@/lib/store";
import { LaunchRow } from "@/components/LaunchRow";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const launches = await listLaunchesSorted();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forge-500">
          Today on Virtual Forge
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Discover what builders ship for agent economies.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Rank launches by upvotes. Submit your SDK, template, agent, or infra
          layer — the feed is sorted by community signal, then recency as a
          tiebreaker.
        </p>
      </section>

      <section className="space-y-3">
        {launches.map((launch, i) => (
          <LaunchRow key={launch.id} launch={launch} rank={i + 1} />
        ))}
      </section>
    </div>
  );
}
