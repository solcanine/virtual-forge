import type { LaunchCategory } from "@/lib/types";

const labels: Record<LaunchCategory, string> = {
  agent: "Agent",
  sdk: "SDK",
  infra: "Infra",
  template: "Template",
  tooling: "Tooling",
};

const styles: Record<LaunchCategory, string> = {
  agent: "bg-violet-500/15 text-violet-200 ring-violet-500/30",
  sdk: "bg-sky-500/15 text-sky-200 ring-sky-500/30",
  infra: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  template: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
  tooling: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
};

export function CategoryPill({ category }: { category: LaunchCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[category]}`}
    >
      {labels[category]}
    </span>
  );
}
