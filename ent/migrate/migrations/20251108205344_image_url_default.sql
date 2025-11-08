-- Modify "components" table
ALTER TABLE "components" ALTER COLUMN "image_url" SET NOT NULL, ALTER COLUMN "image_url" SET DEFAULT 'components/default.png';
