-- Phase 16 bilingual content model
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "name_en" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "name_ar" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "name_en" TEXT;
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "name_ar" TEXT;
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "name_en" TEXT;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "title_ar" TEXT;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "title_en" TEXT;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "description_ar" TEXT;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "description_en" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "event_key" TEXT;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "name_en" TEXT;

CREATE TABLE IF NOT EXISTS "faqs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "question_ar" TEXT NOT NULL,
    "question_en" TEXT NOT NULL,
    "answer_ar" TEXT NOT NULL,
    "answer_en" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "faqs_tenant_id_category_sort_order_idx" ON "faqs"("tenant_id", "category", "sort_order");

DO $$ BEGIN
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
