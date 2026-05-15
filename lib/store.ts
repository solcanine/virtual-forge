import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import type { Launch, LaunchCategory } from "./types";
import { prisma } from "./db";

function mapLaunch(row: {
  id: string;
  title: string;
  tagline: string;
  url: string;
  description: string;
  category: LaunchCategory;
  builder: string;
  voteCount: number;
  createdAt: Date;
}): Launch {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    url: row.url,
    description: row.description,
    category: row.category,
    builder: row.builder,
    voteCount: row.voteCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listLaunchesSorted(): Promise<Launch[]> {
  const rows = await prisma.launch.findMany({
    orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(mapLaunch);
}

export async function getLaunch(id: string): Promise<Launch | null> {
  const row = await prisma.launch.findUnique({ where: { id } });
  return row ? mapLaunch(row) : null;
}

export async function createLaunch(input: {
  title: string;
  tagline: string;
  url: string;
  description: string;
  category: LaunchCategory;
  builder: string;
}): Promise<Launch> {
  const row = await prisma.launch.create({
    data: {
      id: randomUUID(),
      ...input,
    },
  });
  return mapLaunch(row);
}

export async function voteLaunch(
  launchId: string,
  voterId: string,
): Promise<
  | { ok: true; voteCount: number }
  | { ok: false; reason: "already_voted"; voteCount: number }
  | { ok: false; reason: "not_found"; voteCount: number }
> {
  const launch = await prisma.launch.findUnique({ where: { id: launchId } });
  if (!launch) {
    return { ok: false, reason: "not_found", voteCount: 0 };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: { launchId, voterId },
      });
      await tx.launch.update({
        where: { id: launchId },
        data: { voteCount: { increment: 1 } },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const current = await prisma.launch.findUnique({ where: { id: launchId } });
      return {
        ok: false,
        reason: "already_voted",
        voteCount: current?.voteCount ?? launch.voteCount,
      };
    }
    throw e;
  }

  const updated = await prisma.launch.findUnique({ where: { id: launchId } });
  return { ok: true, voteCount: updated?.voteCount ?? launch.voteCount + 1 };
}
