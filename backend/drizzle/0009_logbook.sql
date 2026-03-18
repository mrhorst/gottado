CREATE TABLE "logbook_templates" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "org_id" integer NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "is_system" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "logbook_templates_org_title_idx"
  ON "logbook_templates" ("org_id", "title");

CREATE INDEX "logbook_templates_org_id_idx"
  ON "logbook_templates" ("org_id");

CREATE TABLE "logbook_entries" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "template_id" integer NOT NULL REFERENCES "logbook_templates"("id") ON DELETE CASCADE,
  "author_id" integer NOT NULL REFERENCES "users"("id"),
  "title" varchar(255),
  "body" text NOT NULL,
  "entry_date" date NOT NULL DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "logbook_entries_template_id_idx"
  ON "logbook_entries" ("template_id");

CREATE INDEX "logbook_entries_author_id_idx"
  ON "logbook_entries" ("author_id");

CREATE INDEX "logbook_entries_created_at_idx"
  ON "logbook_entries" ("created_at");

INSERT INTO "logbook_templates" ("org_id", "title", "description", "is_system")
SELECT "id", 'General Log', 'Daily operating notes and manager handoff context.', true
FROM "organizations"
ON CONFLICT ("org_id", "title") DO NOTHING;
