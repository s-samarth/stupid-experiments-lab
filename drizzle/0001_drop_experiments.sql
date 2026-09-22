ALTER TABLE "posts" DROP CONSTRAINT "posts_experiment_id_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_experiment_id_experiments_id_fk";
--> statement-breakpoint
DROP INDEX "posts_experiment_idx";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "kind";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "experiment_id";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "stage";--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN "experiment_id";--> statement-breakpoint
DROP TABLE "experiments";--> statement-breakpoint
DROP TYPE "public"."experiment_status";--> statement-breakpoint
DROP TYPE "public"."post_kind";
