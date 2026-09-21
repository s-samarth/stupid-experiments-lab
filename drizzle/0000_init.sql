CREATE TYPE "public"."experiment_status" AS ENUM('running', 'writing-up', 'done', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."post_kind" AS ENUM('log', 'finding', 'essay');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'published');--> statement-breakpoint
CREATE TYPE "public"."question_source" AS ENUM('owner', 'reader');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'approved', 'rejected', 'promoted');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('confirmed', 'busted', 'weird', 'inconclusive');--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"question" text NOT NULL,
	"hypothesis" text,
	"measure" text,
	"kill_criterion" text,
	"stage" smallint DEFAULT 1 NOT NULL,
	"status" "experiment_status" DEFAULT 'running' NOT NULL,
	"verdict" "verdict",
	"scribble" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"started_on" date,
	"ended_on" date,
	"spawned_from_id" integer,
	"asked_by" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiments_number_unique" UNIQUE("number"),
	CONSTRAINT "experiments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "experiments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "post_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"visitor_hash" text NOT NULL,
	"day" date NOT NULL,
	"referrer_host" text,
	"country" text,
	"device" text,
	"max_depth" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_reads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"subtitle" text,
	"kind" "post_kind" DEFAULT 'essay' NOT NULL,
	"experiment_id" integer,
	"stage" smallint,
	"cover_image" text,
	"body" jsonb DEFAULT '{"type":"doc","content":[]}'::jsonb NOT NULL,
	"body_html" text DEFAULT '' NOT NULL,
	"reading_minutes" smallint DEFAULT 1 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"social_image" text,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"asker_name" text,
	"source" "question_source" DEFAULT 'owner' NOT NULL,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"experiment_id" integer,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "share_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"channel" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "share_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_spawned_from_id_experiments_id_fk" FOREIGN KEY ("spawned_from_id") REFERENCES "public"."experiments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_events" ADD CONSTRAINT "share_events_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "post_reads_unique_visit" ON "post_reads" USING btree ("post_id","visitor_hash","day");--> statement-breakpoint
CREATE INDEX "post_reads_day_idx" ON "post_reads" USING btree ("day");--> statement-breakpoint
CREATE INDEX "posts_status_published_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "posts_experiment_idx" ON "posts" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "share_events_post_idx" ON "share_events" USING btree ("post_id");