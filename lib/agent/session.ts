import type { ChatMessage } from "./types";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const MAX_MESSAGES = 40;

function asMessages(json: Prisma.JsonValue): ChatMessage[] {
  if (!Array.isArray(json)) return [];
  const out: ChatMessage[] = [];
  for (const item of json) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const role = o.role;
    const content = o.content;
    if (role !== "user" && role !== "assistant" && role !== "system") continue;
    if (typeof content !== "string") continue;
    out.push({ role, content });
  }
  return out;
}

export async function loadSession(voterId: string): Promise<ChatMessage[]> {
  const row = await prisma.agentSession.findUnique({
    where: { voterId },
  });
  if (!row) return [];
  return asMessages(row.messages);
}

export async function saveSession(voterId: string, messages: ChatMessage[]) {
  const slice = messages.slice(-MAX_MESSAGES) as unknown as Prisma.InputJsonValue;
  await prisma.agentSession.upsert({
    where: { voterId },
    create: { voterId, messages: slice },
    update: { messages: slice },
  });
}

export async function deleteSession(voterId: string) {
  await prisma.agentSession.deleteMany({ where: { voterId } });
}
