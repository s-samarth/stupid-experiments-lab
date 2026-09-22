ALTER TABLE "posts" ADD COLUMN "verdict" "verdict";--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "post_id" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;