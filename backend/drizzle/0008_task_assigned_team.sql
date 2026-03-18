ALTER TABLE "tasks"
ADD COLUMN "assigned_team_id" integer REFERENCES "teams"("id");
