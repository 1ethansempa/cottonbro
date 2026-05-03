CREATE TABLE "account_reinstatement_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_reinstatement_tokens" ADD CONSTRAINT "account_reinstatement_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_reinstatement_tokens_token_hash_idx" ON "account_reinstatement_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "account_reinstatement_tokens_user_id_idx" ON "account_reinstatement_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_reinstatement_tokens_expires_at_idx" ON "account_reinstatement_tokens" USING btree ("expires_at");