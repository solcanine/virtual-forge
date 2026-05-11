import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { Launch, LaunchCategory, VoteRecord } from "./types";
import { dataDir } from "./paths";

const launchesFile = () => path.join(dataDir(), "launches.json");
const votesFile = () => path.join(dataDir(), "votes.json");

const SEED: Launch[] = [
  {
    id: "seed-acp-mock",
    title: "ACP Local Sandbox",
    tagline: "Run Agent Commerce flows offline with fixtures and time travel.",
    url: "https://example.com/acp-sandbox",
    description:
      "A mock ledger + message bus so builders can iterate on agent offers, pricing, and handoffs before touching mainnet fees.",
    category: "infra",
    builder: "Nova Labs",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "seed-agent-console-kit",
    title: "Agent Console Starter",
    tagline: "Opinionated Next.js template wired for agent deploy + health checks.",
    url: "https://example.com/agent-console-kit",
    description:
      "Includes rate limits, structured logs, and a minimal operator dashboard so you ship agents with observability on day one.",
    category: "template",
    builder: "Riverstack",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: "seed-sdk-typed",
    title: "typed-virtuals-client",
    tagline: "Strict TypeScript client for common Virtuals builder APIs.",
    url: "https://example.com/typed-virtuals",
    description:
      "Zod-validated responses, retries with jitter, and composable middleware for signing and tracing.",
    category: "sdk",
    builder: "Kai",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
  },
  {
    id: "seed-butler-playground",
    title: "Butler Routing Playground",
    tagline: "Simulate user intents and watch job routing across mock agents.",
    url: "https://example.com/butler-play",
    description:
      "Replay fixtures, compare routing policies, and export traces for regression tests in your own router.",
    category: "tooling",
    builder: "Orbit Foundry",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "seed-eval-agent",
    title: "EvalBench Agent",
    tagline: "Benchmark agent reliability with synthetic workloads and SLAs.",
    url: "https://example.com/evalbench",
    description:
      "Schedules tasks, measures latency and success rate, and publishes a public scorecard URL for clusters competing on reliability.",
    category: "agent",
    builder: "Signal Garden",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

async function ensureDataFiles() {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(launchesFile());
  } catch {
    await fs.writeFile(launchesFile(), JSON.stringify(SEED, null, 2), "utf8");
  }
  try {
    await fs.access(votesFile());
  } catch {
    await fs.writeFile(votesFile(), JSON.stringify({}, null, 2), "utf8");
  }
}

async function readLaunches(): Promise<Launch[]> {
  await ensureDataFiles();
  const raw = await fs.readFile(launchesFile(), "utf8");
  return JSON.parse(raw) as Launch[];
}

async function writeLaunches(launches: Launch[]) {
  await fs.writeFile(launchesFile(), JSON.stringify(launches, null, 2), "utf8");
}

async function readVotes(): Promise<VoteRecord> {
  await ensureDataFiles();
  const raw = await fs.readFile(votesFile(), "utf8");
  return JSON.parse(raw) as VoteRecord;
}

async function writeVotes(votes: VoteRecord) {
  await fs.writeFile(votesFile(), JSON.stringify(votes, null, 2), "utf8");
}

export async function listLaunchesSorted(): Promise<Launch[]> {
  const launches = await readLaunches();
  return [...launches].sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getLaunch(id: string): Promise<Launch | null> {
  const launches = await readLaunches();
  return launches.find((l) => l.id === id) ?? null;
}

export async function createLaunch(input: {
  title: string;
  tagline: string;
  url: string;
  description: string;
  category: LaunchCategory;
  builder: string;
}): Promise<Launch> {
  await ensureDataFiles();
  const launches = await readLaunches();
  const launch: Launch = {
    id: randomUUID(),
    ...input,
    voteCount: 0,
    createdAt: new Date().toISOString(),
  };
  launches.unshift(launch);
  await writeLaunches(launches);
  return launch;
}

export async function voteLaunch(
  launchId: string,
  voterId: string,
): Promise<
  | { ok: true; voteCount: number }
  | { ok: false; reason: "already_voted"; voteCount: number }
> {
  await ensureDataFiles();
  const votes = await readVotes();
  const existing = votes[launchId] ?? [];
  if (existing.includes(voterId)) {
    const launch = (await readLaunches()).find((l) => l.id === launchId);
    return {
      ok: false,
      reason: "already_voted",
      voteCount: launch?.voteCount ?? 0,
    };
  }

  votes[launchId] = [...existing, voterId];
  await writeVotes(votes);

  const launches = await readLaunches();
  const idx = launches.findIndex((l) => l.id === launchId);
  if (idx === -1) {
    return { ok: false, reason: "already_voted", voteCount: 0 };
  }
  launches[idx] = {
    ...launches[idx],
    voteCount: launches[idx].voteCount + 1,
  };
  await writeLaunches(launches);
  return { ok: true, voteCount: launches[idx].voteCount };
}
