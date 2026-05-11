"use server";

import { revalidatePath } from "next/cache";
import { runAgentTurn } from "@/lib/agent/orchestrator";
import { loadSession, saveSession } from "@/lib/agent/session";
import type { ChatMessage } from "@/lib/agent/types";
import { getVoterId } from "@/lib/voter";

export type SendAgentMessageResult =
  | { ok: true; reply: string; trace: import("@/lib/agent/types").AgentTraceStep[] }
  | { ok: false; error: string };

export async function sendAgentMessage(
  text: string,
): Promise<SendAgentMessageResult> {
  const voterId = await getVoterId();
  const history = await loadSession(voterId);

  const userMessage: ChatMessage = { role: "user", content: text.trim() };
  if (!userMessage.content) {
    return { ok: false, error: "Message is empty." };
  }

  const { reply, trace } = await runAgentTurn(userMessage.content, history);

  const next: ChatMessage[] = [
    ...history,
    userMessage,
    { role: "assistant", content: reply },
  ];
  await saveSession(voterId, next);
  revalidatePath("/agent");

  return { ok: true, reply, trace };
}

export async function clearAgentSession() {
  const voterId = await getVoterId();
  await saveSession(voterId, []);
  revalidatePath("/agent");
}
