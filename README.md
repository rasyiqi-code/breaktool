# 🚀 Breaktool v1.2.0

**Discover. Test. Decide.** - Open source SaaS review platform with verified tester networks.

## Features

- **Multi-role System** - Super Admin, Admin, Verified Tester, Vendor, User roles with granular permissions
- **Structured Reviews** - Value, Usage, Integration scoring system with detailed analysis
- **Professional Testing Framework** - Verified tester network with comprehensive testing reports
- **Community Features** - Discussions, threaded replies, voting system, trust scores
- **Tool Management** - Advanced search, filtering, comparison, and categorization
- **Analytics & Insights** - Platform analytics, user engagement metrics, review analytics
- **Performance Optimized** - Bundle analysis, API caching, database indexing
- **SEO Ready** - Dynamic metadata, structured data, XML sitemaps, Open Graph support
- **Product Hunt Integration** - Official Product Hunt API integration with proper branding
- **Enhanced UX** - Read-only mode for guests, notification badges, interactive buttons
- **Mobile-First Design** - Responsive footer with expandable content and modern UI

## Tech Stack

- **Next.js 15** + **TypeScript** + **Tailwind CSS** + **Shadcn/ui**
- **Prisma** + **Supabase** (PostgreSQL)
- **Stack Auth** + **Role-based Access Control**
- **Performance Monitoring** + **API Caching**

## Quick Start

```bash
git clone https://github.com/rasyiqi-code/breaktool.git
cd breaktool
bun install
cp .env.example .env.local
# Configure your Supabase credentials
bun run db:generate && bun run db:push
bun run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication
│   ├── (dashboard)/       # Role-based dashboards
│   ├── (tools)/           # Tool pages
│   └── api/               # API routes
├── components/             # React components
│   ├── ui/                # Shadcn/ui
│   ├── layout/            # Header, footer, navigation
│   ├── reviews/           # Review system
│   ├── community/         # Community features
│   └── seo/               # SEO components
├── lib/                    # Utilities
│   ├── services/          # Business logic
│   ├── cache/             # API caching
│   └── auth/              # Authentication
└── types/                  # TypeScript types
```

## Scripts

```bash
bun run dev          # Development server with Turbopack
bun run build        # Production build with Prisma generation
bun run build:analyze # Build with bundle analysis
bun run start        # Start production server
bun run lint         # ESLint
bun run type-check   # TypeScript check
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema changes
bun run db:migrate   # Run database migrations
bun run db:studio    # Open Prisma Studio
bun run analyze      # Bundle analysis
```

## Role System

- **Super Admin** - Full system control, user management, analytics
- **Admin** - Content moderation, user verification, vendor approval, tool management
- **Verified Tester** - Professional testing, detailed reports, testing task management
- **Vendor** - Tool management, analytics, subscription features
- **User** - Reviews, discussions, tool discovery, community participation

### Multi-Role Support
Users can have multiple roles with role switching capabilities. The system supports:
- Primary role assignment
- Active role switching
- Role-based permissions and access control
- User role management through admin interface

## Performance

- **Bundle Analysis** - Built-in bundle analysis with optimization recommendations
- **API Caching** - In-memory caching system with configurable TTL
- **Database Optimization** - Indexed queries, connection pooling, optimized schema
- **Image Optimization** - Next.js Image component with WebP/AVIF support
- **SEO** - Dynamic metadata, structured data, XML sitemaps, Open Graph
- **Monitoring** - Core Web Vitals tracking, performance monitoring

## API Documentation

### Core API Endpoints (100+ endpoints)

#### Tools & Categories
- `GET /api/tools` - List tools with filtering and pagination
- `GET /api/tools/[slug]` - Get tool details
- `GET /api/tools/search` - Search tools
- `GET /api/tools/compare` - Compare multiple tools
- `GET /api/categories` - List categories

#### Reviews & Community
- `GET /api/community/reviews` - Get tool reviews
- `POST /api/community/reviews/create` - Create new review
- `GET /api/community/discussions` - Get discussions
- `POST /api/community/discussions` - Create discussion
- `GET /api/community/notifications` - User notifications

#### Testing Framework
- `GET /api/testing/reports` - Get testing reports
- `GET /api/testing/tester-stats/stats/*` - Tester statistics
- `GET /api/testing/reports-management` - Manage testing reports

#### Admin & Management
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `PATCH /api/admin/users/[id]/verification` - User verification
- `PATCH /api/admin/users/[id]/vendor-approval` - Vendor approval

#### Analytics
- `GET /api/analytics/platform` - Platform analytics
- `GET /api/analytics/tool/[id]` - Tool-specific analytics
- `GET /api/analytics/comparison` - Comparison analytics

## Database Schema

### Core Models (15+ models)
- **User** - User profiles, roles, verification status
- **Tool** - SaaS tools with metadata and scoring
- **Review** - User reviews with structured scoring
- **TestingReport** - Professional testing reports
- **Discussion** - Community discussions with threading
- **Category** - Tool categorization
- **UserRole** - Multi-role system support
- **VendorApplication** - Vendor application management
- **VerificationRequest** - Tester verification requests

### Key Features
- **Multi-role System** - Users can have multiple roles
- **Structured Scoring** - Value, Usage, Integration scores
- **Community Features** - Discussions, voting, trust scores
- **Professional Testing** - Comprehensive testing framework
- **Analytics** - User engagement and platform metrics

## Documentation

### 📚 Comprehensive Documentation
- **[Concepts & Features](./docs/CONCEPTS_AND_FEATURES.md)** - Konsep dan fitur lengkap (implemented & planned)
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Dokumentasi lengkap 100+ API endpoints
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Dokumentasi schema database dan relationships
- **[Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md)** - Arsitektur sistem dan design patterns
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Panduan deployment ke berbagai platform
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Panduan teknis untuk developer

## Environment Variables

```env
# Database
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-direct-url"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stack Auth
STACK_AUTH_URL="your-stack-auth-url"
STACK_AUTH_CLIENT_ID="your-client-id"
STACK_AUTH_CLIENT_SECRET="your-client-secret"

# Optional
NEXT_PUBLIC_GA_MEASUREMENT_ID="your-google-analytics-id"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

## Deployment

Ready for **Vercel**, **Netlify**, **Railway**, or **DigitalOcean**.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Security Features

- **Rate Limiting** - API protection against abuse
- **Security Headers** - Comprehensive security configuration
- **Input Validation** - Comprehensive sanitization and validation
- **Error Handling** - React Error Boundaries for graceful error handling
- **Authentication** - Stack Auth integration with JWT tokens
- **Authorization** - Role-based access control

## Development Features

- **TypeScript 100%** - Full type safety across the codebase
- **Bundle Analysis** - Performance monitoring and optimization
- **Database Scripts** - Migration and seeding utilities
- **Sample Data** - Development data generation scripts
- **Error Boundaries** - Graceful error handling
- **Performance Monitoring** - Core Web Vitals tracking

## What's New in v1.2.0

### ✨ Enhanced User Experience
- **Read-only Mode for Guests** - Content visible but interactions require login
- **Red Notification Badges** - Real-time count indicators for reviews, discussions, and reports
- **Interactive Action Buttons** - Visible but non-interactive for non-logged users with login prompts
- **Simplified Recommendation Buttons** - Compact Keep/Try/Stop selection with clear visual feedback

### 🎨 UI/UX Improvements
- **Mobile-Optimized Footer** - Expandable design with clean, simple layout
- **Product Hunt Attribution** - Official branding with proper logo integration
- **Enhanced Component Props** - Added readOnly functionality to all interactive components
- **Better Button Interactions** - Improved UX for non-logged users

### 🔧 Technical Enhancements
- **Component Refactoring** - Enhanced reusability and maintainability
- **Better Error Handling** - Improved user feedback for edge cases
- **Performance Optimizations** - Reduced bundle size and improved loading times
- **Accessibility Improvements** - Better screen reader support and keyboard navigation

### 🐛 Bug Fixes
- **Fixed Product Hunt Logo 404 Error** - Resolved deployment issue with missing assets
- **Updated .gitignore** - Fixed public directory exclusion for Next.js projects
- **Enhanced TypeScript Support** - Resolved unused parameter warnings
- **Optimized Button Interactions** - Better UX for non-logged users

## Roadmap

- [ ] Trust Score System - User reputation calculation
- [ ] Real-time Features (WebSocket) - Live updates and notifications
- [ ] AI-powered Search - Intelligent tool recommendations
- [ ] Advanced Analytics - Business intelligence tools
- [ ] Mobile App (React Native) - Native mobile application

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
