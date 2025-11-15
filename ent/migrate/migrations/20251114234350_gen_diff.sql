-- Modify "tournaments" table
ALTER TABLE "tournaments" ALTER COLUMN "tournament_end" DROP NOT NULL, DROP COLUMN "results";
