import { AgentChat } from "@/components/AgentChat";
import { loadSession } from "@/lib/agent/session";
import { getVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const voterId = await getVoterId();
  const messages = await loadSession(voterId);
  const initialLog = messages
    .filter((m): m is { role: "user" | "assistant"; content: string } =>
      m.role === "user" || m.role === "assistant",
    )
    .map((m) => ({ role: m.role, text: m.content }));

  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const hint = hasKey
    ? `LLM tool-calling enabled (${model}). Tools: leaderboard, launch search, builder playbook.`
    : "Offline mode: deterministic routing plus tools (no API spend). Set OPENAI_API_KEY to enable the LLM planner.";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forge-500">
          Agent MVP
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Forge Butler
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          A small perceive → plan → act → synthesize loop. The agent answers
          questions by calling tools that read this app&apos;s launch data,
          plus a compact Virtuals-style playbook for how to ship agent commerce
          safely. On-chain ACP belongs in a dedicated worker, not in this chat
          route — see the comment in{" "}
          <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs text-forge-400">
            lib/agent/orchestrator.ts
          </code>
          .
        </p>
      </div>

      <AgentChat initialModelHint={hint} initialLog={initialLog} />
    </div>
  );
}
