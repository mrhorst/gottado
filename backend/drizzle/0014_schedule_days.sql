CREATE TABLE "schedule_days" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "org_id" integer NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "schedule_date" date NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'draft',
  "published_by" integer REFERENCES "users"("id"),
  "published_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "schedule_days_org_date_idx" ON "schedule_days" ("org_id", "schedule_date");

ALTER TABLE "labor_shifts" ADD COLUMN "updated_by" integer REFERENCES "users"("id");
