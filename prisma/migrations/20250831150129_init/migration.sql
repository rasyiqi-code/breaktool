-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tools" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "long_description" TEXT,
    "website" VARCHAR(500) NOT NULL,
    "logo_url" VARCHAR(500),
    "category_id" TEXT,
    "pricing_model" VARCHAR(50),
    "starting_price" DECIMAL(10,2),
    "pricing_details" JSONB,
    "verdict" VARCHAR(20),
    "verdict_updated_at" TIMESTAMP(3),
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "verified_reviews" INTEGER NOT NULL DEFAULT 0,
    "admin_reviews" INTEGER NOT NULL DEFAULT 0,
    "overall_score" DECIMAL(3,2),
    "value_score" DECIMAL(3,2),
    "usage_score" DECIMAL(3,2),
    "integration_score" DECIMAL(3,2),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "submitted_by" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "trust_score" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "company" TEXT,
    "linkedin_url" TEXT,
    "website_url" TEXT,
    "location" TEXT,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_verified_tester" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "helpful_votes_received" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'community',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "overall_score" DECIMAL(3,2),
    "value_score" DECIMAL(3,2),
    "usage_score" DECIMAL(3,2),
    "integration_score" DECIMAL(3,2),
    "pain_points" TEXT,
    "setup_time" TEXT,
    "roi_story" TEXT,
    "usage_recommendations" TEXT,
    "weaknesses" TEXT,
    "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendation" VARCHAR(20),
    "use_case" TEXT,
    "company_size" TEXT,
    "industry" TEXT,
    "usage_duration" TEXT,
    "helpful_votes" INTEGER NOT NULL DEFAULT 0,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tool_upvotes" (
    "id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_upvotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tool_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT,
    "logo_url" TEXT,
    "submitted_by" TEXT,
    "submitter_relationship" TEXT,
    "additional_info" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expertise_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "company" TEXT,
    "job_title" TEXT,
    "linkedin_url" TEXT,
    "website_url" TEXT,
    "portfolio_url" TEXT,
    "motivation" TEXT,
    "experience_years" INTEGER,
    "previous_reviews" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tools_slug_key" ON "public"."tools"("slug");

-- CreateIndex
CREATE INDEX "tools_status_featured_idx" ON "public"."tools"("status", "featured");

-- CreateIndex
CREATE INDEX "tools_category_id_idx" ON "public"."tools"("category_id");

-- CreateIndex
CREATE INDEX "tools_created_at_idx" ON "public"."tools"("created_at");

-- CreateIndex
CREATE INDEX "tools_upvotes_idx" ON "public"."tools"("upvotes");

-- CreateIndex
CREATE INDEX "tools_slug_idx" ON "public"."tools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_is_verified_tester_idx" ON "public"."users"("is_verified_tester");

-- CreateIndex
CREATE INDEX "users_trust_score_idx" ON "public"."users"("trust_score");

-- CreateIndex
CREATE INDEX "reviews_tool_id_idx" ON "public"."reviews"("tool_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "public"."reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "public"."reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "public"."reviews"("created_at");

-- CreateIndex
CREATE INDEX "reviews_overall_score_idx" ON "public"."reviews"("overall_score");

-- CreateIndex
CREATE UNIQUE INDEX "review_votes_review_id_user_id_key" ON "public"."review_votes"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tool_upvotes_tool_id_user_id_key" ON "public"."tool_upvotes"("tool_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."tools" ADD CONSTRAINT "tools_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_votes" ADD CONSTRAINT "review_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_votes" ADD CONSTRAINT "review_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tool_upvotes" ADD CONSTRAINT "tool_upvotes_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tool_upvotes" ADD CONSTRAINT "tool_upvotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tool_submissions" ADD CONSTRAINT "tool_submissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tool_submissions" ADD CONSTRAINT "tool_submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
