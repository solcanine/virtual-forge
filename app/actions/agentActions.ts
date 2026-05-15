"use server";

import { revalidatePath } from "next/cache";
import { runAgentTurn } from "@/lib/agent/orchestrator";
import { loadSession, saveSession, deleteSession } from "@/lib/agent/session";
import type { ChatMessage } from "@/lib/agent/types";
import {
  RateLimitError,
  consumeRateLimit,
  minuteWindowSlot,
} from "@/lib/rate-limit";
import { getVoterId } from "@/lib/voter";

const MAX_MESSAGE_CHARS = 6000;

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
  if (userMessage.content.length > MAX_MESSAGE_CHARS) {
    return {
      ok: false,
      error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).`,
    };
  }

  try {
    await consumeRateLimit({
      scope: "agent_chat_per_minute",
      actorId: voterId,
      windowSlot: minuteWindowSlot(),
      limit: 24,
      errorMessage:
        "Too many agent messages from this browser. Slow down for a minute.",
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { ok: false, error: e.message };
    }
    throw e;
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
  await deleteSession(voterId);
  revalidatePath("/agent");
}
