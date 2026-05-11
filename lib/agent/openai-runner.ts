import type { ChatMessage, AgentTurnResult, AgentTraceStep } from "./types";
import { TOOL_SPECS, runTool, type ToolName } from "./tools";

type OpenAiToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

function trace(
  phase: AgentTraceStep["phase"],
  title: string,
  detail?: string,
): AgentTraceStep {
  return { phase, title, detail };
}

function isToolName(name: string): name is ToolName {
  return TOOL_SPECS.some((s) => s.name === name);
}

export async function runOpenAiAgent(
  userText: string,
  history: ChatMessage[],
): Promise<AgentTurnResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const steps: AgentTraceStep[] = [];
  steps.push(trace("perceive", "User message", userText.slice(0, 280)));

  const tools = TOOL_SPECS.map((spec) => ({
    type: "function" as const,
    function: {
      name: spec.name,
      description: spec.description,
      parameters: spec.parameters,
    },
  }));

  const system: ChatMessage = {
    role: "system",
    content: [
      "You are Forge Butler, an agent helping Virtuals-era builders explore the Virtual Forge launch board.",
      "Prefer tools for anything about launches, votes, or board content.",
      "Use virtuals_builder_playbook for ecosystem shipping questions (ACP, reliability, discovery).",
      "Answer in concise Markdown. If a tool returns Markdown, keep it readable.",
    ].join(" "),
  };

  type ApiMsg =
    | { role: "system" | "user" | "assistant"; content: string | null }
    | {
        role: "tool";
        tool_call_id: string;
        content: string;
      }
    | {
        role: "assistant";
        content: string | null;
        tool_calls: OpenAiTool[];
      };

  type OpenAiTool = {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  };

  const messages: ApiMsg[] = [
    system,
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userText },
  ];

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  for (let round = 0; round < 5; round++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      steps.push(
        trace("plan", "OpenAI request failed", `${res.status} ${errText.slice(0, 400)}`),
      );
      return { reply: "I could not reach the model right now. Try again in a moment.", trace: steps };
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: OpenAiToolCall[];
        };
      }>;
    };

    const choice = data.choices?.[0]?.message;
    if (!choice) {
      steps.push(trace("plan", "Empty model response"));
      return { reply: "I got an empty response from the model.", trace: steps };
    }

    if (choice.tool_calls?.length) {
      steps.push(
        trace(
          "plan",
          `Model proposed ${choice.tool_calls.length} tool call(s)`,
          choice.tool_calls.map((c) => c.function.name).join(", "),
        ),
      );

      messages.push({
        role: "assistant",
        content: choice.content ?? "",
        tool_calls: choice.tool_calls.map((c) => ({
          id: c.id,
          type: "function" as const,
          function: { name: c.function.name, arguments: c.function.arguments },
        })),
      });

      for (const call of choice.tool_calls) {
        const name = call.function.name;
        let args: Record<string, unknown> = {};
        try {
          args = call.function.arguments
            ? (JSON.parse(call.function.arguments) as Record<string, unknown>)
            : {};
        } catch {
          args = {};
        }

        if (!isToolName(name)) {
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: `Unknown tool: ${name}`,
          });
          continue;
        }

        const out = await runTool(name, args);
        steps.push(trace("act", `Tool: ${name}`, out.slice(0, 800)));
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: out,
        });
      }
      continue;
    }

    const text = choice.content?.trim() || "…";
    steps.push(trace("synthesize", "Model final answer"));
    return { reply: text, trace: steps };
  }

  steps.push(trace("plan", "Stopped after max tool rounds"));
  return {
    reply: "I hit my internal step limit while calling tools. Ask something simpler?",
    trace: steps,
  };
}
