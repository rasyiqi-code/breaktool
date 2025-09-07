-- Create tool_ownership_claims table
CREATE TABLE "public"."tool_ownership_claims" (
    "id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "claim_type" VARCHAR(50) NOT NULL,
    "company_name" TEXT,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "website" TEXT,
    "business_registration" TEXT,
    "proof_of_ownership" TEXT,
    "additional_info" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_ownership_claims_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint
CREATE UNIQUE INDEX "tool_ownership_claims_tool_id_vendor_id_key" ON "public"."tool_ownership_claims"("tool_id", "vendor_id");

-- Create indexes
CREATE INDEX "tool_ownership_claims_status_idx" ON "public"."tool_ownership_claims"("status");
CREATE INDEX "tool_ownership_claims_created_at_idx" ON "public"."tool_ownership_claims"("created_at");
CREATE INDEX "tool_ownership_claims_vendor_id_idx" ON "public"."tool_ownership_claims"("vendor_id");

-- Add foreign key constraints
ALTER TABLE "public"."tool_ownership_claims" ADD CONSTRAINT "tool_ownership_claims_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."tool_ownership_claims" ADD CONSTRAINT "tool_ownership_claims_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."tool_ownership_claims" ADD CONSTRAINT "tool_ownership_claims_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
