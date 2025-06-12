/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Account` table. All the data in the column will be lost.
  - The required column `id` was added to the `Account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `Series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WatchedEpisode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("access_token", "expires_at", "id_token", "provider", "providerAccountId", "refresh_token", "scope", "session_state", "token_type", "type", "userId") SELECT "access_token", "expires_at", "id_token", "provider", "providerAccountId", "refresh_token", "scope", "session_state", "token_type", "type", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE TABLE "new_Series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "seriesTmdbId" TEXT NOT NULL,
    "latestWatchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Series" ("createdAt", "id", "latestWatchedAt", "posterPath", "seriesTmdbId", "title") SELECT "createdAt", "id", "latestWatchedAt", "posterPath", "seriesTmdbId", "title" FROM "Series";
DROP TABLE "Series";
ALTER TABLE "new_Series" RENAME TO "Series";
CREATE UNIQUE INDEX "Series_id_key" ON "Series"("id");
CREATE UNIQUE INDEX "Series_seriesTmdbId_userId_key" ON "Series"("seriesTmdbId", "userId");
CREATE TABLE "new_WatchedEpisode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonNumber" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "watchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seriesId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "WatchedEpisode_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatchedEpisode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WatchedEpisode" ("episodeNumber", "id", "seasonNumber", "seriesId", "watchedAt") SELECT "episodeNumber", "id", "seasonNumber", "seriesId", "watchedAt" FROM "WatchedEpisode";
DROP TABLE "WatchedEpisode";
ALTER TABLE "new_WatchedEpisode" RENAME TO "WatchedEpisode";
CREATE UNIQUE INDEX "WatchedEpisode_seriesId_seasonNumber_episodeNumber_userId_key" ON "WatchedEpisode"("seriesId", "seasonNumber", "episodeNumber", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
