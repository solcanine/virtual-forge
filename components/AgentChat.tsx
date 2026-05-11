"use client";

import { useMemo, useState, useTransition } from "react";
import {
  clearAgentSession,
  sendAgentMessage,
  type SendAgentMessageResult,
} from "@/app/actions/agentActions";
import type { AgentTraceStep } from "@/lib/agent/types";

type Props = {
  initialModelHint: string;
  initialLog: Array<{
    role: "user" | "assistant";
    text: string;
    trace?: AgentTraceStep[];
  }>;
};

export function AgentChat({ initialModelHint, initialLog }: Props) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState(initialLog);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const transcript = useMemo(
    () =>
      log.map((m, i) => (
        <div
          key={i}
          className={
            m.role === "user"
              ? "ml-auto max-w-[90%] rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-100"
              : "mr-auto max-w-[90%] rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200"
          }
        >
          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
          {m.role === "assistant" && m.trace?.length ? (
            <details className="mt-3 border-t border-zinc-800 pt-2 text-xs text-zinc-500">
              <summary className="cursor-pointer select-none text-zinc-400 hover:text-zinc-200">
                Agent trace
              </summary>
              <ol className="mt-2 space-y-2">
                {m.trace.map((s, j) => (
                  <li key={j}>
                    <span className="font-mono text-forge-500">{s.phase}</span>{" "}
                    <span className="text-zinc-300">{s.title}</span>
                    {s.detail ? (
                      <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-2 text-[11px] text-zinc-500">
                        {s.detail}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </div>
      )),
    [log],
  );

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;
    setInput("");
    setError(null);
    setLog((prev) => [...prev, { role: "user", text: trimmed }]);

    start(async () => {
      const res: SendAgentMessageResult = await sendAgentMessage(trimmed);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setLog((prev) => [
        ...prev,
        { role: "assistant", text: res.reply, trace: res.trace },
      ]);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-400">
        <p className="font-medium text-zinc-200">Runtime</p>
        <p className="mt-1">{initialModelHint}</p>
      </div>

      <div className="flex min-h-[320px] flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        {log.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ask about the board (“What’s trending?”), a product keyword (“ACP”), or
            Virtuals shipping practice (“How should I think about ACP?”).
          </p>
        ) : (
          transcript
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSend} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-forge-500/30 focus:border-forge-600 focus:ring-2 disabled:opacity-60"
          placeholder="Message Forge Butler…"
          aria-label="Message text"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="rounded-xl bg-forge-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forge-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Thinking…" : "Send"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              start(async () => {
                await clearAgentSession();
                setLog([]);
              });
            }}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
