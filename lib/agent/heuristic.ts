import type { AgentTraceStep, AgentTurnResult } from "./types";
import { runTool, type ToolName } from "./tools";

function trace(
  phase: AgentTraceStep["phase"],
  title: string,
  detail?: string,
): AgentTraceStep {
  return { phase, title, detail };
}

function inferTool(userText: string):
  | { kind: "tool"; tool: ToolName; args: Record<string, unknown> }
  | { kind: "playbook" }
  | { kind: "smalltalk" } {
  const t = userText.toLowerCase().trim();

  if (/^(hi|hello|hey|thanks|thank you|yo)\b/.test(t)) {
    return { kind: "smalltalk" };
  }

  if (
    /\b(acp|virtuals|virtual protocol|commerce|sdk|deploy|cluster|sla)\b/.test(
      t,
    )
  ) {
    return { kind: "playbook" };
  }

  if (
    /\b(leaderboard|trending|top|votes?|rank|board|what'?s hot|ships?)\b/.test(
      t,
    )
  ) {
    return { kind: "tool", tool: "list_leaderboard", args: { limit: 5 } };
  }

  if (
    t.includes("tell me about") ||
    t.includes("what is") ||
    t.includes("details on") ||
    t.includes("more about")
  ) {
    const stripped = userText
      .replace(/^(?:tell me about|what is|details on|more about)\s+/i, "")
      .replace(/\?+$/, "")
      .trim();
    if (stripped.length >= 2) {
      return { kind: "tool", tool: "find_launch", args: { query: stripped } };
    }
  }

  if (t.length >= 3) {
    return { kind: "tool", tool: "find_launch", args: { query: userText.trim() } };
  }

  return { kind: "smalltalk" };
}

export async function runHeuristicAgent(userText: string): Promise<AgentTurnResult> {
  const steps: AgentTraceStep[] = [];
  steps.push(
    trace("perceive", "User message", userText.slice(0, 280)),
  );

  const plan = inferTool(userText);
  if (plan.kind === "smalltalk") {
    steps.push(
      trace("plan", "No data tool selected", "Short conversational reply."),
    );
    const reply = [
      "Hey — I am **Forge Butler**, the agent wired to this launch board.",
      "",
      "Try: “What’s trending?” or “Tell me about ACP sandbox”.",
    ].join("\n");
    steps.push(trace("synthesize", "Compose reply"));
    return { reply, trace: steps };
  }

  if (plan.kind === "playbook") {
    steps.push(
      trace("plan", "Playbook intent", "Virtuals-era shipping guidance."),
    );
    const toolOut = await runTool("virtuals_builder_playbook", {});
    steps.push(trace("act", "Tool: virtuals_builder_playbook"));
    steps.push(trace("synthesize", "Return playbook markdown"));
    return { reply: toolOut, trace: steps };
  }

  steps.push(
    trace(
      "plan",
      `Call tool **${plan.tool}**`,
      JSON.stringify(plan.args),
    ),
  );
  const toolOut = await runTool(plan.tool, plan.args);
  steps.push(trace("act", `Tool: ${plan.tool}`, toolOut.slice(0, 500)));
  steps.push(
    trace(
      "synthesize",
      "Format tool output for chat",
      "Pass-through with light framing.",
    ),
  );

  const reply = [
    "Here is what I pulled from the board:",
    "",
    toolOut,
  ].join("\n");

  return { reply, trace: steps };
}
