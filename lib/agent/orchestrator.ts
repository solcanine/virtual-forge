/**
 * Forge Butler — sample agent logic (MVP)
 *
 * 1) **Perceive** — read the latest user turn (and optional short history).
 * 2) **Plan** — choose between:
 *    - LLM tool-calling (when `OPENAI_API_KEY` is set) using the three tools in `tools.ts`, or
 *    - a **deterministic router** in `heuristic.ts` (always works offline).
 * 3) **Act** — execute tools (board queries + a static Virtuals-oriented playbook).
 * 4) **Synthesize** — return a single assistant message (+ trace for debugging).
 *
 * **Virtual Protocol / ACP extension point**
 * On-chain ACP sellers need wallet material and a long-lived Node worker. This web app
 * intentionally keeps commerce signing *out* of the hot path. A production shape is:
 * `Next.js (chat UI)` → `queue/job table` → `acp-worker (Node + @virtuals-protocol/acp-node)`
 * so keys never ship to the browser bundle.
 */

import type { ChatMessage, AgentTurnResult } from "./types";
import { runHeuristicAgent } from "./heuristic";
import { runOpenAiAgent } from "./openai-runner";

export async function runAgentTurn(
  userText: string,
  history: ChatMessage[],
): Promise<AgentTurnResult> {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      reply: "Send a non-empty message — for example: “What’s trending?”",
      trace: [{ phase: "perceive", title: "Empty input" }],
    };
  }

  const llm = await runOpenAiAgent(trimmed, history);
  if (llm) return llm;

  return runHeuristicAgent(trimmed);
}
