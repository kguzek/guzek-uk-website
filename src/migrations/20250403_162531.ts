import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "emails_blocks_email_button" CASCADE;
  DROP TABLE "emails_blocks_rich_text" CASCADE;
  DROP TABLE "emails_blocks_email_template" CASCADE;
  ALTER TABLE "emails" ADD COLUMN "title" varchar DEFAULT '' NOT NULL;
  ALTER TABLE "emails" ADD COLUMN "content" jsonb DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Hello{USERNAME},","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":"ltr","textStyle":"","textFormat":0},{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"You are receiving this email because ","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":"ltr","textStyle":"","textFormat":0}],"direction":"ltr"}}'::jsonb NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "emails_blocks_email_button" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "emails_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "emails_blocks_email_template" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"block_name" varchar
  );
  
  DO $$ BEGIN
   ALTER TABLE "emails_blocks_email_button" ADD CONSTRAINT "emails_blocks_email_button_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "emails_blocks_rich_text" ADD CONSTRAINT "emails_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "emails_blocks_email_template" ADD CONSTRAINT "emails_blocks_email_template_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_button_order_idx" ON "emails_blocks_email_button" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_button_parent_id_idx" ON "emails_blocks_email_button" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_button_path_idx" ON "emails_blocks_email_button" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "emails_blocks_rich_text_order_idx" ON "emails_blocks_rich_text" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_blocks_rich_text_parent_id_idx" ON "emails_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_rich_text_path_idx" ON "emails_blocks_rich_text" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_template_order_idx" ON "emails_blocks_email_template" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_template_parent_id_idx" ON "emails_blocks_email_template" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_template_path_idx" ON "emails_blocks_email_template" USING btree ("_path");
  ALTER TABLE "emails" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "emails" DROP COLUMN IF EXISTS "content";`)
}
