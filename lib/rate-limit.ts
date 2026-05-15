import { prisma } from "@/lib/db";

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterSeconds: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Fixed-window counter in the database. Works across multiple app instances
 * (unlike in-memory limits). Uses a coarse slot (minute or hour).
 */
export async function consumeRateLimit(input: {
  scope: string;
  actorId: string;
  windowSlot: number;
  limit: number;
  errorMessage?: string;
}): Promise<void> {
  const { scope, actorId, windowSlot, limit, errorMessage } = input;

  const row = await prisma.$transaction(async (tx) => {
    const existing = await tx.rateBucket.findUnique({
      where: {
        scope_actorId_windowSlot: { scope, actorId, windowSlot },
      },
    });
    if (!existing) {
      return tx.rateBucket.create({
        data: { scope, actorId, windowSlot, count: 1 },
      });
    }
    return tx.rateBucket.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });
  });

  if (row.count > limit) {
    throw new RateLimitError(
      errorMessage ?? "Too many requests. Please wait and try again.",
      60,
    );
  }
}

export function minuteWindowSlot(ts = Date.now()) {
  return Math.floor(ts / 60_000);
}

export function hourWindowSlot(ts = Date.now()) {
  return Math.floor(ts / 3_600_000);
}
