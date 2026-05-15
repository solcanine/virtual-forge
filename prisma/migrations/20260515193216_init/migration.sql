-- CreateTable
CREATE TABLE "Launch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "builder" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "launchId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_launchId_fkey" FOREIGN KEY ("launchId") REFERENCES "Launch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentSession" (
    "voterId" TEXT NOT NULL PRIMARY KEY,
    "messages" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RateBucket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "windowSlot" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "Launch_voteCount_idx" ON "Launch"("voteCount");

-- CreateIndex
CREATE INDEX "Launch_createdAt_idx" ON "Launch"("createdAt");

-- CreateIndex
CREATE INDEX "Vote_voterId_idx" ON "Vote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_launchId_voterId_key" ON "Vote"("launchId", "voterId");

-- CreateIndex
CREATE INDEX "RateBucket_scope_actorId_idx" ON "RateBucket"("scope", "actorId");

-- CreateIndex
CREATE UNIQUE INDEX "RateBucket_scope_actorId_windowSlot_key" ON "RateBucket"("scope", "actorId", "windowSlot");
