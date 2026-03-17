CREATE TABLE "task_lists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_lists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"section_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_lists" ADD CONSTRAINT "task_lists_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "task_lists_section_id_idx" ON "task_lists" USING btree ("section_id");
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "list_id" integer;
--> statement-breakpoint
INSERT INTO "task_lists" ("section_id", "name", "sort_order")
SELECT "id", 'General', 0 FROM "sections";
--> statement-breakpoint
UPDATE "tasks" t
SET "list_id" = tl."id"
FROM "task_lists" tl
WHERE tl."section_id" = t."section_id";
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "list_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_list_id_task_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."task_lists"("id") ON DELETE no action ON UPDATE no action;
