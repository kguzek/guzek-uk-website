import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_emails_recipients_type" AS ENUM('manual', 'user');
  ALTER TABLE "emails_recipients" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "emails_recipients" ADD COLUMN "type" "enum_emails_recipients_type" DEFAULT 'manual' NOT NULL;
  ALTER TABLE "emails_recipients" ADD COLUMN "user_id" varchar;
  DO $$ BEGIN
   ALTER TABLE "emails_recipients" ADD CONSTRAINT "emails_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "emails_recipients_user_idx" ON "emails_recipients" USING btree ("user_id");
  ALTER TABLE "emails" DROP COLUMN IF EXISTS "sent";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "emails_recipients" DROP CONSTRAINT "emails_recipients_user_id_users_id_fk";
  
  DROP INDEX IF EXISTS "emails_recipients_user_idx";
  ALTER TABLE "emails_recipients" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "emails" ADD COLUMN "sent" boolean DEFAULT false;
  ALTER TABLE "emails_recipients" DROP COLUMN IF EXISTS "type";
  ALTER TABLE "emails_recipients" DROP COLUMN IF EXISTS "user_id";
  DROP TYPE "public"."enum_emails_recipients_type";`)
}
