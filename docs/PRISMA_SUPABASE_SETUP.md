# Prisma + Supabase Setup Guide

## 🎯 **Architecture Overview**

This project uses **Prisma as ORM** with **Supabase as PostgreSQL database provider**.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│   Prisma ORM    │───▶│  Supabase DB    │
│                 │    │                 │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Configuration**

### **1. Environment Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ttdhuqwuhcovjsobbwjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2QzrR5lAIK3VGptmEGl70w_LvVvFfHv
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (Prisma)
DATABASE_URL="postgresql://postgres.ttdhuqwuhcovjsobbwjs:0jNbNRVu1YHzLaBw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ttdhuqwuhcovjsobbwjs:0jNbNRVu1YHzLaBw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### **2. Prisma Schema**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### **3. Prisma Client Setup**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 📦 **Dependencies**

### **Package.json**
```json
{
  "dependencies": {
    "@prisma/client": "^6.15.0",
    "prisma": "^6.15.0"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

## 🚀 **Usage Examples**

### **1. Service Layer**
```typescript
// src/lib/services/reviews/reviews.service.ts
import { prisma } from '@/lib/prisma'

export class ReviewsService {
  static async getToolReviews(toolId: string) {
    return await prisma.review.findMany({
      where: { toolId },
      include: { user: true }
    })
  }
  
  static async createReview(data: CreateReviewData) {
    return await prisma.review.create({ data })
  }
}
```

### **2. API Routes**
```typescript
// src/app/api/community/reviews/route.ts
import { ReviewsService } from '@/lib/services/reviews/reviews.service'

export async function GET(request: NextRequest) {
  const reviews = await ReviewsService.getToolReviews(toolId)
  return NextResponse.json(reviews)
}

export async function POST(request: NextRequest) {
  const review = await ReviewsService.createReview(data)
  return NextResponse.json(review)
}
```

### **3. Database Operations**
```typescript
// Get tools with categories
const tools = await prisma.tool.findMany({
  include: {
    category: true,
    reviews: true
  }
})

// Create new review
const review = await prisma.review.create({
  data: {
    toolId: 'tool-id',
    userId: 'user-id',
    title: 'Great tool!',
    content: 'This tool is amazing...',
    type: 'community'
  }
})

// Update tool statistics
await prisma.tool.update({
  where: { id: toolId },
  data: {
    totalReviews: { increment: 1 }
  }
})
```

## 🛠️ **Commands**

### **Development**
```bash
# Generate Prisma client
bun run db:generate

# Push schema changes to database
bun run db:push

# Run migrations
bun run db:migrate

# Open Prisma Studio
bun run db:studio
```

### **Production**
```bash
# Generate client for production
prisma generate

# Deploy migrations
prisma migrate deploy
```

## ✅ **Benefits of Prisma + Supabase**

### **Prisma Benefits:**
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Query Builder**: Intuitive API
- ✅ **Migrations**: Schema versioning
- ✅ **Studio**: Database GUI
- ✅ **Performance**: Optimized queries

### **Supabase Benefits:**
- ✅ **Managed PostgreSQL**: No server management
- ✅ **Real-time**: WebSocket subscriptions
- ✅ **Auth**: Built-in authentication
- ✅ **Storage**: File storage
- ✅ **Edge Functions**: Serverless functions

### **Combined Benefits:**
- ✅ **Best of Both**: Prisma's developer experience + Supabase's infrastructure
- ✅ **Scalability**: Managed database with type-safe queries
- ✅ **Development Speed**: Fast iteration with Prisma Studio
- ✅ **Production Ready**: Supabase handles scaling and maintenance

## 🔍 **Current Status**

### **✅ Working:**
- Prisma client generated and connected
- Database schema synced with Supabase
- Service layer using Prisma
- API routes using Prisma
- 3 tools and 2 reviews in database

### **🎯 Next Steps:**
- Add more complex queries
- Implement real-time subscriptions
- Add database indexes for performance
- Set up monitoring and logging

## 📊 **Database Stats**
- **Tools**: 3 records
- **Reviews**: 2 records
- **Categories**: Available
- **Connection**: ✅ Active
