-- AlterTable
ALTER TABLE "Food" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "Food_category_idx" ON "Food"("category");

