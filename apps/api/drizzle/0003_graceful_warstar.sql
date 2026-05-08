CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'partner');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");