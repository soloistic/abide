CREATE TYPE "Fruit" AS ENUM (
  'LOVE',
  'JOY',
  'PEACE',
  'PATIENCE',
  'KINDNESS',
  'GOODNESS',
  'FAITHFULNESS',
  'GENTLENESS',
  'SELF_CONTROL'
);

CREATE TABLE "FruitReflection" (
  "id" TEXT NOT NULL,
  "reflectionDate" DATE NOT NULL,
  "journalText" TEXT NOT NULL,
  "fruits" "Fruit"[],
  "scriptureRef" TEXT,
  "lessonLearned" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FruitReflection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FruitReflection_reflectionDate_key"
  ON "FruitReflection"("reflectionDate");

CREATE INDEX "FruitReflection_reflectionDate_idx"
  ON "FruitReflection"("reflectionDate" DESC);
