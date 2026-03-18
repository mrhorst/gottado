CREATE TABLE "labor_shifts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "labor_shifts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"shift_date" date NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"area_id" integer,
	"assigned_team_id" integer,
	"assigned_user_id" integer,
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "labor_shift_title_not_empty" CHECK ("labor_shifts"."title" <> '')
);
--> statement-breakpoint
ALTER TABLE "labor_shifts" ADD CONSTRAINT "labor_shifts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "labor_shifts" ADD CONSTRAINT "labor_shifts_area_id_sections_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "labor_shifts" ADD CONSTRAINT "labor_shifts_assigned_team_id_teams_id_fk" FOREIGN KEY ("assigned_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "labor_shifts" ADD CONSTRAINT "labor_shifts_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "labor_shifts" ADD CONSTRAINT "labor_shifts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "labor_shifts_org_id_idx" ON "labor_shifts" USING btree ("org_id");
--> statement-breakpoint
CREATE INDEX "labor_shifts_shift_date_idx" ON "labor_shifts" USING btree ("shift_date");
--> statement-breakpoint
CREATE INDEX "labor_shifts_area_id_idx" ON "labor_shifts" USING btree ("area_id");
--> statement-breakpoint
CREATE INDEX "labor_shifts_team_id_idx" ON "labor_shifts" USING btree ("assigned_team_id");
--> statement-breakpoint
CREATE INDEX "labor_shifts_user_id_idx" ON "labor_shifts" USING btree ("assigned_user_id");
