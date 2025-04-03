import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "emails_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar
  );
  
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
  
  CREATE TABLE IF NOT EXISTS "emails" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject" varchar NOT NULL,
  	"from_address" varchar DEFAULT 'noreply@guzek.uk' NOT NULL,
  	"from_name" varchar DEFAULT 'noreply@guzek.uk' NOT NULL,
  	"sent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "emails_id" integer;
  DO $$ BEGIN
   ALTER TABLE "emails_recipients" ADD CONSTRAINT "emails_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
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
  
  CREATE INDEX IF NOT EXISTS "emails_recipients_order_idx" ON "emails_recipients" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_recipients_parent_id_idx" ON "emails_recipients" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_button_order_idx" ON "emails_blocks_email_button" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_button_parent_id_idx" ON "emails_blocks_email_button" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_button_path_idx" ON "emails_blocks_email_button" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "emails_blocks_rich_text_order_idx" ON "emails_blocks_rich_text" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_blocks_rich_text_parent_id_idx" ON "emails_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_rich_text_path_idx" ON "emails_blocks_rich_text" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_template_order_idx" ON "emails_blocks_email_template" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_template_parent_id_idx" ON "emails_blocks_email_template" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "emails_blocks_email_template_path_idx" ON "emails_blocks_email_template" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "emails_updated_at_idx" ON "emails" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "emails_created_at_idx" ON "emails" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_emails_fk" FOREIGN KEY ("emails_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_emails_id_idx" ON "payload_locked_documents_rels" USING btree ("emails_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "emails_recipients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "emails_blocks_email_button" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "emails_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "emails_blocks_email_template" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "emails" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "emails_recipients" CASCADE;
  DROP TABLE "emails_blocks_email_button" CASCADE;
  DROP TABLE "emails_blocks_rich_text" CASCADE;
  DROP TABLE "emails_blocks_email_template" CASCADE;
  DROP TABLE "emails" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_emails_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_emails_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "emails_id";`)
}
