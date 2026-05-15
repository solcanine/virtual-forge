import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seeds = [
  {
    id: "seed-acp-mock",
    title: "ACP Local Sandbox",
    tagline: "Run Agent Commerce flows offline with fixtures and time travel.",
    url: "https://example.com/acp-sandbox",
    description:
      "A mock ledger + message bus so builders can iterate on agent offers, pricing, and handoffs before touching mainnet fees.",
    category: "infra" as const,
    builder: "Nova Labs",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "seed-agent-console-kit",
    title: "Agent Console Starter",
    tagline:
      "Opinionated Next.js template wired for agent deploy + health checks.",
    url: "https://example.com/agent-console-kit",
    description:
      "Includes rate limits, structured logs, and a minimal operator dashboard so you ship agents with observability on day one.",
    category: "template" as const,
    builder: "Riverstack",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
  },
  {
    id: "seed-sdk-typed",
    title: "typed-virtuals-client",
    tagline: "Strict TypeScript client for common Virtuals builder APIs.",
    url: "https://example.com/typed-virtuals",
    description:
      "Zod-validated responses, retries with jitter, and composable middleware for signing and tracing.",
    category: "sdk" as const,
    builder: "Kai",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52),
  },
  {
    id: "seed-butler-playground",
    title: "Butler Routing Playground",
    tagline:
      "Simulate user intents and watch job routing across mock agents.",
    url: "https://example.com/butler-play",
    description:
      "Replay fixtures, compare routing policies, and export traces for regression tests in your own router.",
    category: "tooling" as const,
    builder: "Orbit Foundry",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "seed-eval-agent",
    title: "EvalBench Agent",
    tagline: "Benchmark agent reliability with synthetic workloads and SLAs.",
    url: "https://example.com/evalbench",
    description:
      "Schedules tasks, measures latency and success rate, and publishes a public scorecard URL for clusters competing on reliability.",
    category: "agent" as const,
    builder: "Signal Garden",
    voteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
];

async function main() {
  const existing = await prisma.launch.count();
  if (existing > 0) {
    console.log("Database already has launches — skipping seed.");
    return;
  }
  await prisma.launch.createMany({ data: seeds });
  console.log(`Seeded ${seeds.length} launches.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
