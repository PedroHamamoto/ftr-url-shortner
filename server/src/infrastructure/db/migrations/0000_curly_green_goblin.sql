CREATE TABLE "links" (
	"id" text PRIMARY KEY NOT NULL,
	"original_url" varchar(255) NOT NULL,
	"short_url" varchar(20) NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "links_short_url_unique" UNIQUE("short_url")
);
--> statement-breakpoint
CREATE INDEX "idx_short_url" ON "links" USING btree ("short_url");