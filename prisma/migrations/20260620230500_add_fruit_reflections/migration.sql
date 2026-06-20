-- CreateEnum
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

-- CreateTable
CREATE TABLE "fruit_reflections" (
    "id" TEXT NOT NULL,
    "reflection_date" DATE NOT NULL,
    "journal_text" TEXT NOT NULL,
    "fruits" "Fruit"[],
    "scripture_reference" TEXT,
    "lesson_learned" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fruit_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fruit_reflections_reflection_date_key" ON "fruit_reflections"("reflection_date");
