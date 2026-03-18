-- Deduplicate: keep latest entry per (template_id, entry_date)
DELETE FROM "logbook_entries" a
USING "logbook_entries" b
WHERE a.template_id = b.template_id
  AND a.entry_date = b.entry_date
  AND a.id < b.id;

-- Drop title column
ALTER TABLE "logbook_entries" DROP COLUMN "title";

-- Enforce one entry per template per day
CREATE UNIQUE INDEX "logbook_entries_template_date_idx"
  ON "logbook_entries" ("template_id", "entry_date");

-- Edit history table
CREATE TABLE "logbook_entry_edits" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "entry_id" integer NOT NULL REFERENCES "logbook_entries"("id") ON DELETE CASCADE,
  "editor_id" integer NOT NULL REFERENCES "users"("id"),
  "previous_body" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "logbook_entry_edits_entry_id_idx"
  ON "logbook_entry_edits" ("entry_id");
