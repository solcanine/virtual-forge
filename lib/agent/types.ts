export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AgentTraceStep = {
  phase: "perceive" | "plan" | "act" | "synthesize";
  title: string;
  detail?: string;
};

export type AgentTurnResult = {
  reply: string;
  trace: AgentTraceStep[];
};
