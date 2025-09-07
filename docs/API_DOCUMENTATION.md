# BreakTool API Documentation

## Overview

BreakTool menyediakan RESTful API yang komprehensif dengan 100+ endpoints untuk mengelola tools, reviews, users, dan fitur komunitas.

## Base URL
```
Production: https://breaktool.com/api
Development: http://localhost:3000/api
```

## Authentication

### Stack Auth Integration
- **Provider**: Stack Auth
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <token>`

### Role-based Access Control
- **Super Admin**: Full access
- **Admin**: Content moderation, user management
- **Verified Tester**: Testing reports, professional reviews
- **Vendor**: Tool management, analytics
- **User**: Reviews, discussions, tool discovery

---

## Core API Endpoints

### 🔧 Tools & Categories

#### Get Tools
```http
GET /api/tools
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category slug
- `search` (string): Search query
- `sort` (string): Sort by field (created_at, upvotes, overall_score)
- `order` (string): Sort order (asc, desc)
- `featured` (boolean): Filter featured tools
- `status` (string): Filter by status (active, archived, pending)

**Response:**
```json
{
  "tools": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "website": "string",
      "logoUrl": "string",
      "category": {
        "id": "string",
        "name": "string",
        "slug": "string"
      },
      "pricingModel": "free|freemium|paid|enterprise",
      "startingPrice": 0,
      "verdict": "keep|try|stop",
      "upvotes": 0,
      "totalReviews": 0,
      "overallScore": 0,
      "featured": false,
      "status": "active|archived|pending",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get Tool Details
```http
GET /api/tools/[slug]
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "longDescription": "string",
  "website": "string",
  "logoUrl": "string",
  "category": {
    "id": "string",
    "name": "string",
    "slug": "string"
  },
  "pricingModel": "string",
  "startingPrice": 0,
  "pricingDetails": {},
  "verdict": "string",
  "upvotes": 0,
  "totalReviews": 0,
  "verifiedReviews": 0,
  "adminReviews": 0,
  "overallScore": 0,
  "valueScore": 0,
  "usageScore": 0,
  "integrationScore": 0,
  "featured": false,
  "status": "string",
  "viewCount": 0,
  "tags": ["string"],
  "reviews": [],
  "discussions": [],
  "testingReports": [],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Search Tools
```http
GET /api/tools/search
```

**Query Parameters:**
- `q` (string): Search query (required)
- `category` (string): Filter by category
- `pricing` (string): Filter by pricing model
- `minScore` (number): Minimum overall score
- `maxScore` (number): Maximum overall score

#### Compare Tools
```http
GET /api/tools/compare
```

**Query Parameters:**
- `ids` (string[]): Tool IDs to compare (comma-separated)

#### Get Categories
```http
GET /api/categories
```

---

### 👥 User Management

#### Get Users
```http
GET /api/users
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `verified` (boolean): Filter verified testers
- `search` (string): Search query

#### Get User Profile
```http
GET /api/users/[id]
```

#### Update User
```http
PATCH /api/users/[id]
```

#### Verify User
```http
PATCH /api/users/[id]/verification
```

**Body:**
```json
{
  "status": "approved|rejected",
  "notes": "string"
}
```

#### Approve Vendor
```http
PATCH /api/users/[id]/vendor-approval
```

---

### 📝 Reviews & Community

#### Get Reviews
```http
GET /api/community/reviews
```

**Query Parameters:**
- `toolId` (string): Filter by tool
- `userId` (string): Filter by user
- `type` (string): Filter by type (community, verified, admin)
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

#### Create Review
```http
POST /api/community/reviews/create
```

**Body:**
```json
{
  "toolId": "string",
  "title": "string",
  "content": "string",
  "overallScore": 8.5,
  "valueScore": 8.0,
  "usageScore": 9.0,
  "integrationScore": 8.5,
  "painPoints": "string",
  "setupTime": "string",
  "roiStory": "string",
  "usageRecommendations": "string",
  "weaknesses": "string",
  "pros": ["string"],
  "cons": ["string"],
  "recommendation": "keep|try|stop",
  "useCase": "string",
  "companySize": "string",
  "industry": "string",
  "usageDuration": "string"
}
```

#### Vote on Review
```http
POST /api/community/reviews/[id]/vote
```

**Body:**
```json
{
  "voteType": "helpful|not_helpful"
}
```

#### Get Discussions
```http
GET /api/community/discussions
```

#### Create Discussion
```http
POST /api/community/discussions
```

**Body:**
```json
{
  "toolId": "string",
  "title": "string",
  "content": "string"
}
```

#### Get Discussion Replies
```http
GET /api/community/discussions/[id]/replies
```

#### Create Discussion Reply
```http
POST /api/community/discussions/[id]/replies
```

**Body:**
```json
{
  "content": "string",
  "parentReplyId": "string"
}
```

#### Get Notifications
```http
GET /api/community/notifications
```

---

### 🧪 Testing Framework

#### Get Testing Reports
```http
GET /api/testing/reports
```

**Query Parameters:**
- `toolId` (string): Filter by tool
- `testerId` (string): Filter by tester
- `status` (string): Filter by status
- `approved` (boolean): Filter approved reports

#### Get Testing Tasks
```http
GET /api/testing/tasks
```

#### Create Testing Task
```http
POST /api/testing/tasks
```

**Body:**
```json
{
  "toolId": "string",
  "testerId": "string",
  "title": "string",
  "description": "string",
  "priority": "high|medium|low",
  "deadline": "2024-01-01T00:00:00Z",
  "reward": 100
}
```

#### Submit Testing Report
```http
POST /api/testing/reports
```

**Body:**
```json
{
  "taskId": "string",
  "title": "string",
  "summary": "string",
  "detailedAnalysis": "string",
  "overallScore": 8.5,
  "valueScore": 8.0,
  "usageScore": 9.0,
  "integrationScore": 8.5,
  "pros": ["string"],
  "cons": ["string"],
  "recommendations": "string",
  "useCases": ["string"],
  "setupTime": "string",
  "learningCurve": "string",
  "supportQuality": "string",
  "documentation": "string",
  "performance": "string",
  "security": "string",
  "scalability": "string",
  "costEffectiveness": "string",
  "verdict": "keep|try|stop"
}
```

#### Approve Testing Report
```http
PATCH /api/testing/reports/[id]/approve
```

**Body:**
```json
{
  "approved": true,
  "reviewNotes": "string"
}
```

#### Get Tester Statistics
```http
GET /api/testing/tester-stats/stats/[testerId]
```

---

### 🏢 Vendor Management

#### Get Vendor Applications
```http
GET /api/vendor/applications
```

#### Submit Vendor Application
```http
POST /api/vendor/applications
```

**Body:**
```json
{
  "companyName": "string",
  "companySize": "string",
  "industry": "string",
  "websiteUrl": "string",
  "linkedinUrl": "string",
  "companyDescription": "string",
  "productsServices": "string",
  "targetAudience": "string",
  "businessModel": "string",
  "motivation": "string"
}
```

#### Submit Tool
```http
POST /api/vendor/tools/submit
```

**Body:**
```json
{
  "name": "string",
  "website": "string",
  "description": "string",
  "categoryId": "string",
  "logoUrl": "string",
  "pricingModel": "string",
  "startingPrice": 0,
  "pricingDetails": {},
  "tags": ["string"]
}
```

#### Get Vendor Analytics
```http
GET /api/vendor/analytics
```

---

### 👨‍💼 Admin Management

#### Get Platform Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 1000,
    "verifiedTesters": 50,
    "vendors": 25,
    "newThisMonth": 100
  },
  "tools": {
    "total": 500,
    "featured": 20,
    "pending": 15,
    "newThisMonth": 30
  },
  "reviews": {
    "total": 2000,
    "verified": 200,
    "admin": 50,
    "newThisMonth": 150
  },
  "discussions": {
    "total": 500,
    "active": 400,
    "newThisMonth": 50
  }
}
```

#### Get User Management
```http
GET /api/admin/users
```

#### Get Tool Management
```http
GET /api/admin/tools
```

#### Get Review Management
```http
GET /api/admin/reviews
```

#### Get Testing Reports Management
```http
GET /api/admin/testing-reports
```

---

### 📊 Analytics

#### Get Platform Analytics
```http
GET /api/analytics/platform
```

**Query Parameters:**
- `period` (string): Time period (7d, 30d, 90d, 1y)
- `metric` (string): Specific metric to analyze

#### Get Tool Analytics
```http
GET /api/analytics/tool/[id]
```

#### Get Comparison Analytics
```http
GET /api/analytics/comparison
```

**Query Parameters:**
- `toolIds` (string[]): Tool IDs to compare

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### Rate Limiting
- **Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @breaktool/api-client
```

### Python
```bash
pip install breaktool-api
```

### Go
```bash
go get github.com/breaktool/api-go
```

---

## Webhooks

### Available Events
- `user.verified`
- `tool.approved`
- `review.created`
- `testing.report.approved`
- `discussion.created`

### Webhook Payload
```json
{
  "event": "string",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z",
  "signature": "string"
}
```

---

## Support

- **Documentation**: [docs.breaktool.com](https://docs.breaktool.com)
- **Support**: [support@breaktool.com](mailto:support@breaktool.com)
- **GitHub**: [github.com/breaktool/api](https://github.com/breaktool/api)
