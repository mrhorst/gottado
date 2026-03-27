CREATE TABLE "issue_records" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "issue_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"category" varchar(20) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"entry_date" date NOT NULL,
	"area_id" integer,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_record_title_not_empty" CHECK ("issue_records"."title" <> '')
);
--> statement-breakpoint
ALTER TABLE "issue_records" ADD CONSTRAINT "issue_records_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issue_records" ADD CONSTRAINT "issue_records_area_id_sections_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issue_records" ADD CONSTRAINT "issue_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "issue_records_org_id_idx" ON "issue_records" USING btree ("org_id");
--> statement-breakpoint
CREATE INDEX "issue_records_entry_date_idx" ON "issue_records" USING btree ("entry_date");
--> statement-breakpoint
CREATE INDEX "issue_records_category_idx" ON "issue_records" USING btree ("category");
--> statement-breakpoint
CREATE INDEX "issue_records_severity_idx" ON "issue_records" USING btree ("severity");
--> statement-breakpoint
CREATE INDEX "issue_records_area_id_idx" ON "issue_records" USING btree ("area_id");
