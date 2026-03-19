CREATE TABLE "day_parts" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "org_id" integer NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "name" varchar(100) NOT NULL,
  "start_time" varchar(5) NOT NULL,
  "end_time" varchar(5) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "day_parts_org_id_idx" ON "day_parts" ("org_id");
CREATE UNIQUE INDEX "day_parts_org_id_name_idx" ON "day_parts" ("org_id", "name");
