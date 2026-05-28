-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "height" REAL,
    "tdee" REAL,
    "activity" TEXT,
    "goal" TEXT,
    "waterGoal" INTEGER NOT NULL DEFAULT 2500,
    "targetCalories" REAL DEFAULT 2000,
    "targetProtein" REAL DEFAULT 60,
    "targetCarbs" REAL DEFAULT 250,
    "targetFat" REAL DEFAULT 65,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserSettings" ("activity", "createdAt", "goal", "height", "id", "tdee", "updatedAt", "userId", "waterGoal") SELECT "activity", "createdAt", "goal", "height", "id", "tdee", "updatedAt", "userId", "waterGoal" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

