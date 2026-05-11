import { listLaunchesSorted, getLaunch } from "@/lib/store";

export type ToolName =
  | "list_leaderboard"
  | "find_launch"
  | "virtuals_builder_playbook";

export async function runTool(
  name: ToolName,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "list_leaderboard": {
      const limit = Math.min(
        10,
        Math.max(1, Number(args.limit ?? 5) || 5),
      );
      const rows = await listLaunchesSorted();
      const slice = rows.slice(0, limit);
      if (!slice.length) {
        return "No launches on the board yet. Invite someone to submit one.";
      }
      return slice
        .map(
          (l, i) =>
            `${i + 1}. **${l.title}** (${l.voteCount} votes) — ${l.tagline}\n   Builder: ${l.builder} · Category: ${l.category} · id: \`${l.id}\``,
        )
        .join("\n\n");
    }
    case "find_launch": {
      const q = String(args.query ?? "")
        .trim()
        .toLowerCase();
      if (q.length < 2) {
        return "Tell me a keyword from the title or tagline to search.";
      }
      const rows = await listLaunchesSorted();
      const hits = rows.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.tagline.toLowerCase().includes(q) ||
          l.builder.toLowerCase().includes(q),
      );
      if (!hits.length) {
        return `No launches matched “${q}”. Try another keyword or ask for the leaderboard.`;
      }
      const top = hits.slice(0, 3);
      const blocks = await Promise.all(
        top.map(async (l) => {
          const full = (await getLaunch(l.id)) ?? l;
          return [
            `### ${full.title}`,
            `Votes: ${full.voteCount} · Category: ${full.category} · Builder: ${full.builder}`,
            `Tagline: ${full.tagline}`,
            `Link: ${full.url}`,
            "",
            full.description,
          ].join("\n");
        }),
      );
      return blocks.join("\n\n---\n\n");
    }
    case "virtuals_builder_playbook": {
      return [
        "### Virtuals / agent-economy checklist (high level)",
        "",
        "- **ACP**: design a clear *offer* (inputs, SLA, refund/deliverable shape) before you chase chain plumbing.",
        "- **Reliability beats vibes**: log traces, replay fixtures, and measure success rate — clusters compete on uptime.",
        "- **Human boundaries**: approvals for spend, tool permissions, and rate limits are part of the product.",
        "- **Discovery**: one sharp tagline + a demo URL beats a manifesto — this board exists for that reason.",
        "",
        "When you are ready for **on-chain ACP**, run a dedicated Node worker with wallet material — not inside a random web route.",
      ].join("\n");
    }
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}

export const TOOL_SPECS = [
  {
    name: "list_leaderboard" as const,
    description:
      "Return the current Virtual Forge leaderboard: titles, vote counts, builders, categories, and ids.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "How many rows to return (1-10). Default 5.",
        },
      },
    },
  },
  {
    name: "find_launch" as const,
    description:
      "Find launches by keyword in title, tagline, or builder name and return rich details.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword to search for." },
      },
      required: ["query"],
    },
  },
  {
    name: "virtuals_builder_playbook" as const,
    description:
      "Return concise, practical guidance for shipping agents and commerce flows in a Virtuals-style ecosystem.",
    parameters: { type: "object", properties: {} },
  },
];
