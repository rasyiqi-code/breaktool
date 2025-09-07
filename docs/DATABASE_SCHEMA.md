# BreakTool Database Schema

## Overview

BreakTool menggunakan PostgreSQL dengan Prisma ORM untuk mengelola data. Database ini dirancang untuk mendukung sistem multi-role, review terstruktur, dan fitur komunitas yang komprehensif.

## Database Models

### 👤 User Model
```prisma
model User {
  id                   String                @id
  email                String                @unique
  name                 String?
  avatarUrl            String?               @map("avatar_url")
  role                 String                @default("user") @db.VarChar(50) // Legacy field
  primaryRole          String?               @map("primary_role") @db.VarChar(50)
  activeRole           String?               @map("active_role") @db.VarChar(50)
  roleSwitchedAt       DateTime?             @map("role_switched_at")
  trustScore           Int                   @default(0) @map("trust_score")
  badges               String[]              @default([])
  bio                  String?
  company              String?
  linkedinUrl          String?               @map("linkedin_url")
  websiteUrl           String?               @map("website_url")
  location             String?
  expertise            String[]              @default([])
  isVerifiedTester     Boolean               @default(false) @map("is_verified_tester")
  verificationStatus   String                @default("pending") @map("verification_status") @db.VarChar(50)
  verifiedAt           DateTime?             @map("verified_at")
  verifiedBy           String?               @map("verified_by")
  vendorStatus         String?               @map("vendor_status") @db.VarChar(50)
  vendorApprovedAt     DateTime?             @map("vendor_approved_at")
  vendorApprovedBy     String?               @map("vendor_approved_by")
  helpfulVotesReceived Int                   @default(0) @map("helpful_votes_received")
  createdAt            DateTime              @default(now()) @map("created_at")
  updatedAt            DateTime              @updatedAt @map("updated_at")
  
  // Relations
  discussionReplies    DiscussionReply[]
  discussionReplyVotes DiscussionReplyVote[]
  discussionVotes      DiscussionVote[]
  discussions          Discussion[]
  reviewVotes          ReviewVote[]
  reviews              Review[]
  approvedReports      TestingReport[]       @relation("TestingReportApprover")
  testingReports       TestingReport[]
  testingTasks         TestingTask[]
  toolSubmissions      ToolSubmission[]
  toolUpvotes          ToolUpvote[]
  verificationRequests VerificationRequest[]
  vendorApplications   VendorApplication[]
  userRoles            UserRole[]

  @@index([email])
  @@index([primaryRole])
  @@index([activeRole])
  @@index([role])
  @@index([isVerifiedTester])
  @@index([trustScore])
  @@index([verificationStatus])
  @@map("users")
}
```

**Key Features:**
- Multi-role support dengan primary dan active role
- Trust score system untuk reputasi user
- Verification system untuk tester dan vendor
- Comprehensive user profile dengan social links

### 🛠️ Tool Model
```prisma
model Tool {
  id               String          @id @default(cuid())
  name             String          @db.VarChar(255)
  slug             String          @unique @db.VarChar(255)
  description      String?
  longDescription  String?         @map("long_description")
  website          String          @db.VarChar(500)
  logoUrl          String?         @map("logo_url") @db.VarChar(500)
  categoryId       String?         @map("category_id")
  pricingModel     String?         @map("pricing_model") @db.VarChar(50)
  startingPrice    Decimal?        @map("starting_price") @db.Decimal(10, 2)
  pricingDetails   Json?           @map("pricing_details")
  verdict          String?         @db.VarChar(20)
  verdictUpdatedAt DateTime?       @map("verdict_updated_at")
  upvotes          Int             @default(0)
  totalReviews     Int             @default(0) @map("total_reviews")
  verifiedReviews  Int             @default(0) @map("verified_reviews")
  adminReviews     Int             @default(0) @map("admin_reviews")
  overallScore     Decimal?        @map("overall_score") @db.Decimal(3, 2)
  valueScore       Decimal?        @map("value_score") @db.Decimal(3, 2)
  usageScore       Decimal?        @map("usage_score") @db.Decimal(3, 2)
  integrationScore Decimal?        @map("integration_score") @db.Decimal(3, 2)
  featured         Boolean         @default(false)
  status           String          @default("active") @db.VarChar(50)
  submittedBy      String?         @map("submitted_by")
  viewCount        Int             @default(0) @map("view_count")
  tags             String[]        @default([])
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")
  
  // Relations
  discussions      Discussion[]
  reviews          Review[]
  testingReports   TestingReport[]
  testingTasks     TestingTask[]
  toolUpvotes      ToolUpvote[]
  category         Category?       @relation(fields: [categoryId], references: [id])

  @@index([status, featured])
  @@index([categoryId])
  @@index([createdAt])
  @@index([upvotes])
  @@index([slug])
  @@index([overallScore])
  @@index([pricingModel])
  @@index([verdict])
  @@index([status, createdAt])
  @@index([featured, createdAt])
  @@map("tools")
}
```

**Key Features:**
- Comprehensive tool metadata
- Structured scoring system (overall, value, usage, integration)
- Verdict system (keep, try, stop)
- Performance-optimized indexing

### 📝 Review Model
```prisma
model Review {
  id                   String       @id @default(cuid())
  toolId               String       @map("tool_id")
  userId               String       @map("user_id")
  type                 String       @default("community") @db.VarChar(50)
  title                String
  content              String
  overallScore         Decimal?     @map("overall_score") @db.Decimal(3, 2)
  valueScore           Decimal?     @map("value_score") @db.Decimal(3, 2)
  usageScore           Decimal?     @map("usage_score") @db.Decimal(3, 2)
  integrationScore     Decimal?     @map("integration_score") @db.Decimal(3, 2)
  painPoints           String?      @map("pain_points")
  setupTime            String?      @map("setup_time")
  roiStory             String?      @map("roi_story")
  usageRecommendations String?      @map("usage_recommendations")
  weaknesses           String?
  pros                 String[]     @default([])
  cons                 String[]     @default([])
  recommendation       String?      @db.VarChar(20)
  useCase              String?      @map("use_case")
  companySize          String?      @map("company_size")
  industry             String?
  usageDuration        String?      @map("usage_duration")
  helpfulVotes         Int          @default(0) @map("helpful_votes")
  totalVotes           Int          @default(0) @map("total_votes")
  status               String       @default("active") @db.VarChar(50)
  featured             Boolean      @default(false)
  createdAt            DateTime     @default(now()) @map("created_at")
  updatedAt            DateTime     @updatedAt @map("updated_at")
  
  // Relations
  reviewVotes          ReviewVote[]
  tool                 Tool         @relation(fields: [toolId], references: [id], onDelete: Cascade)
  user                 User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([toolId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([overallScore])
  @@index([type])
  @@index([recommendation])
  @@index([toolId, status])
  @@index([userId, status])
  @@index([createdAt, status])
  @@map("reviews")
}
```

**Key Features:**
- Structured scoring system dengan 3 dimensi
- Detailed analysis fields
- Context information (company size, industry, etc.)
- Voting system untuk review quality

### 🧪 Testing Framework Models

#### TestingTask Model
```prisma
model TestingTask {
  id          String         @id @default(cuid())
  toolId      String         @map("tool_id")
  testerId    String         @map("tester_id")
  title       String
  description String?
  status      String         @default("pending") @db.VarChar(50)
  priority    String         @default("medium") @db.VarChar(50)
  deadline    DateTime
  reward      Int            @default(0)
  assignedAt  DateTime       @default(now()) @map("assigned_at")
  startedAt   DateTime?      @map("started_at")
  completedAt DateTime?      @map("completed_at")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")
  
  // Relations
  report      TestingReport?
  tester      User           @relation(fields: [testerId], references: [id], onDelete: Cascade)
  tool        Tool           @relation(fields: [toolId], references: [id], onDelete: Cascade)

  @@index([testerId])
  @@index([toolId])
  @@index([status])
  @@index([priority])
  @@index([deadline])
  @@map("testing_tasks")
}
```

#### TestingReport Model
```prisma
model TestingReport {
  id                String      @id @default(cuid())
  taskId            String      @unique @map("task_id")
  toolId            String      @map("tool_id")
  testerId          String      @map("tester_id")
  title             String
  summary           String
  detailedAnalysis  String?     @map("detailed_analysis")
  overallScore      Decimal?    @map("overall_score") @db.Decimal(3, 2)
  valueScore        Decimal?    @map("value_score") @db.Decimal(3, 2)
  usageScore        Decimal?    @map("usage_score") @db.Decimal(3, 2)
  integrationScore  Decimal?    @map("integration_score") @db.Decimal(3, 2)
  pros              String[]    @default([])
  cons              String[]    @default([])
  recommendations   String?
  useCases          String[]    @default([]) @map("use_cases")
  setupTime         String?     @map("setup_time")
  learningCurve     String?     @map("learning_curve")
  supportQuality    String?     @map("support_quality")
  documentation     String?
  performance       String?
  security          String?
  scalability       String?
  costEffectiveness String?     @map("cost_effectiveness")
  verdict           String?     @db.VarChar(20)
  status            String      @default("draft") @db.VarChar(50)
  isApproved        Boolean     @default(false) @map("is_approved")
  approvedBy        String?     @map("approved_by")
  approvedAt        DateTime?   @map("approved_at")
  reviewNotes       String?     @map("review_notes")
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")
  
  // Relations
  approver          User?       @relation("TestingReportApprover", fields: [approvedBy], references: [id])
  task              TestingTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tester            User        @relation(fields: [testerId], references: [id], onDelete: Cascade)
  tool              Tool        @relation(fields: [toolId], references: [id], onDelete: Cascade)

  @@index([testerId])
  @@index([toolId])
  @@index([status])
  @@index([verdict])
  @@index([createdAt])
  @@map("testing_reports")
}
```

### 💬 Community Models

#### Discussion Model
```prisma
model Discussion {
  id                String            @id @default(cuid())
  title             String
  content           String
  toolId            String            @map("tool_id")
  userId            String            @map("user_id")
  status            String            @default("active") @db.VarChar(50)
  isPinned          Boolean           @default(false) @map("is_pinned")
  isFeatured        Boolean           @default(false) @map("is_featured")
  viewCount         Int               @default(0) @map("view_count")
  replyCount        Int               @default(0) @map("reply_count")
  lastReplyAt       DateTime?         @map("last_reply_at")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  
  // Relations
  discussionReplies DiscussionReply[]
  discussionVotes   DiscussionVote[]
  tool              Tool              @relation(fields: [toolId], references: [id], onDelete: Cascade)
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([toolId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([isPinned])
  @@index([isFeatured])
  @@map("discussions")
}
```

#### DiscussionReply Model
```prisma
model DiscussionReply {
  id                   String                @id @default(cuid())
  discussionId         String                @map("discussion_id")
  userId               String                @map("user_id")
  content              String
  parentReplyId        String?               @map("parent_reply_id")
  isSolution           Boolean               @default(false) @map("is_solution")
  helpfulVotes         Int                   @default(0) @map("helpful_votes")
  totalVotes           Int                   @default(0) @map("total_votes")
  status               String                @default("active") @db.VarChar(50)
  createdAt            DateTime              @default(now()) @map("created_at")
  updatedAt            DateTime              @updatedAt @map("updated_at")
  
  // Relations
  discussion           Discussion            @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  parentReply          DiscussionReply?      @relation("ReplyReplies", fields: [parentReplyId], references: [id], onDelete: Cascade)
  childReplies         DiscussionReply[]     @relation("ReplyReplies")
  user                 User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  discussionReplyVotes DiscussionReplyVote[]

  @@index([discussionId])
  @@index([userId])
  @@index([parentReplyId])
  @@index([createdAt])
  @@map("discussion_replies")
}
```

### 🏷️ Category Model
```prisma
model Category {
  id              String           @id @default(cuid())
  name            String           @unique @db.VarChar(255)
  slug            String           @unique @db.VarChar(255)
  description     String?
  icon            String?          @db.VarChar(50)
  color           String?          @db.VarChar(7)
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  
  // Relations
  toolSubmissions ToolSubmission[]
  tools           Tool[]

  @@index([slug])
  @@map("categories")
}
```

### 📋 Application Models

#### ToolSubmission Model
```prisma
model ToolSubmission {
  id                    String    @id @default(cuid())
  name                  String
  website               String
  description           String?
  categoryId            String?   @map("category_id")
  logoUrl               String?   @map("logo_url")
  submittedBy           String?   @map("submitted_by")
  submitterRelationship String?   @map("submitter_relationship")
  additionalInfo        String?   @map("additional_info")
  status                String    @default("pending") @db.VarChar(50)
  reviewedBy            String?   @map("reviewed_by")
  reviewedAt            DateTime? @map("reviewed_at")
  reviewNotes           String?   @map("review_notes")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  // Relations
  category              Category? @relation(fields: [categoryId], references: [id])
  user                  User?     @relation(fields: [submittedBy], references: [id])

  @@map("tool_submissions")
}
```

#### VerificationRequest Model
```prisma
model VerificationRequest {
  id              String    @id @default(cuid())
  userId          String    @map("user_id")
  expertiseAreas  String[]  @default([]) @map("expertise_areas")
  company         String?
  jobTitle        String?   @map("job_title")
  linkedinUrl     String?   @map("linkedin_url")
  websiteUrl      String?   @map("website_url")
  portfolioUrl    String?   @map("portfolio_url")
  motivation      String?
  experienceYears Int?      @map("experience_years")
  previousReviews String?   @map("previous_reviews")
  status          String    @default("pending") @db.VarChar(50)
  reviewedBy      String?   @map("reviewed_by")
  reviewedAt      DateTime? @map("reviewed_at")
  reviewNotes     String?   @map("review_notes")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([createdAt])
  @@index([status])
  @@index([userId])
  @@map("verification_requests")
}
```

#### VendorApplication Model
```prisma
model VendorApplication {
  id                  String   @id @default(cuid())
  userId              String   @map("user_id")
  companyName         String   @map("company_name")
  companySize         String   @map("company_size")
  industry            String
  websiteUrl          String   @map("website_url")
  linkedinUrl         String?  @map("linkedin_url")
  companyDescription  String   @map("company_description")
  productsServices    String   @map("products_services")
  targetAudience      String   @map("target_audience")
  businessModel       String   @map("business_model")
  motivation          String
  status              String   @default("pending") @db.VarChar(50)
  reviewedBy          String?  @map("reviewed_by")
  reviewedAt          DateTime? @map("reviewed_at")
  reviewNotes         String?  @map("review_notes")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("vendor_applications")
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

### 👥 Multi-Role System

#### UserRole Model
```prisma
model UserRole {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  role      String   @db.VarChar(50)
  isActive  Boolean  @default(true) @map("is_active")
  grantedAt DateTime @default(now()) @map("granted_at")
  grantedBy String?  @map("granted_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, role])
  @@index([userId])
  @@index([role])
  @@index([isActive])
  @@index([grantedAt])
  @@map("user_roles")
}
```

## Database Indexes

### Performance Optimization
Database menggunakan indexing yang komprehensif untuk optimasi performa:

#### User Indexes
- `email` - Unique constraint untuk login
- `primaryRole`, `activeRole` - Role-based queries
- `isVerifiedTester` - Tester verification queries
- `trustScore` - Trust score sorting
- `verificationStatus` - Verification workflow

#### Tool Indexes
- `slug` - URL routing
- `status, featured` - Tool listing queries
- `categoryId` - Category filtering
- `overallScore` - Score-based sorting
- `pricingModel` - Pricing filtering
- `verdict` - Verdict filtering
- `createdAt` - Time-based queries

#### Review Indexes
- `toolId, status` - Tool-specific reviews
- `userId, status` - User-specific reviews
- `overallScore` - Score-based sorting
- `type` - Review type filtering
- `recommendation` - Recommendation filtering

#### Discussion Indexes
- `toolId` - Tool-specific discussions
- `userId` - User-specific discussions
- `isPinned`, `isFeatured` - Featured content
- `createdAt` - Time-based sorting

## Data Relationships

### Key Relationships
1. **User ↔ Tool**: Many-to-many through reviews, discussions, upvotes
2. **Tool ↔ Category**: Many-to-one relationship
3. **User ↔ Review**: One-to-many relationship
4. **Tool ↔ Review**: One-to-many relationship
5. **Discussion ↔ DiscussionReply**: One-to-many with self-referencing
6. **TestingTask ↔ TestingReport**: One-to-one relationship
7. **User ↔ UserRole**: One-to-many for multi-role support

### Cascade Deletes
- User deletion cascades to reviews, discussions, testing reports
- Tool deletion cascades to reviews, discussions, testing tasks
- Discussion deletion cascades to replies and votes

## Migration Strategy

### Current Migrations
- `20250831150129_init` - Initial schema setup
- `add_multi_role_system.sql` - Multi-role system implementation
- `add_vendor_application.sql` - Vendor application system

### Migration Commands
```bash
# Generate Prisma client
bun run db:generate

# Push schema changes
bun run db:push

# Run migrations
bun run db:migrate

# Open Prisma Studio
bun run db:studio
```

## Data Seeding

### Available Scripts
- `seed-database.ts` - Main seeding script
- `add-dummy-tools.mjs` - Tool data
- `add-dummy-reviews.mjs` - Review data
- `add-dummy-submissions.mjs` - Submission data
- `add-dummy-testing-tasks.mjs` - Testing data
- `run-all-dummy-data.mjs` - Run all seeding scripts

### Seeding Commands
```bash
# Run all dummy data
bun run scripts/run-all-dummy-data.mjs

# Seed specific data
bun run scripts/seed-database.ts
```

## Performance Considerations

### Query Optimization
- Comprehensive indexing strategy
- Connection pooling with Supabase
- Query result caching
- Pagination for large datasets

### Data Integrity
- Foreign key constraints
- Unique constraints
- Check constraints for enums
- Cascade delete rules

### Scalability
- Horizontal scaling ready
- Read replicas support
- Database partitioning potential
- Archive strategy for old data
