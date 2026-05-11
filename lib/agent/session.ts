import fs from "fs/promises";
import path from "path";
import type { ChatMessage } from "./types";
import { dataDir } from "@/lib/paths";

const sessionsDir = () => path.join(dataDir(), "agent-chats");

function sessionFile(voterId: string) {
  return path.join(sessionsDir(), `${voterId}.json`);
}

export type AgentSessionFile = {
  messages: ChatMessage[];
  updatedAt: string;
};

async function ensureDir() {
  await fs.mkdir(sessionsDir(), { recursive: true });
}

export async function loadSession(voterId: string): Promise<ChatMessage[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(sessionFile(voterId), "utf8");
    const parsed = JSON.parse(raw) as AgentSessionFile;
    return Array.isArray(parsed.messages) ? parsed.messages : [];
  } catch {
    return [];
  }
}

export async function saveSession(voterId: string, messages: ChatMessage[]) {
  await ensureDir();
  const payload: AgentSessionFile = {
    messages: messages.slice(-40),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(sessionFile(voterId), JSON.stringify(payload, null, 2), "utf8");
}
