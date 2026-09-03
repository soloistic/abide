CREATE TABLE "TestimonyDraft" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "theme" TEXT,
  "body" TEXT NOT NULL,
  "reflectionIds" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TestimonyDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TestimonyDraft_updatedAt_idx" ON "TestimonyDraft"("updatedAt" DESC);
