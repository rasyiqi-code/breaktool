# Developer Guide

## Quick Setup

```bash
git clone https://github.com/rasyiqi-code/breaktool.git
cd breaktool
bun install
cp .env.example .env.local
# Configure Supabase credentials
bun run db:generate && bun run db:push
bun run dev
```

## Architecture

### Tech Stack
- **Next.js 15** - App Router, Server Components
- **TypeScript** - Full type safety
- **Prisma** - Database ORM
- **Supabase** - PostgreSQL database
- **Stack Auth** - Authentication
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Role-based dashboards
│   ├── (tools)/           # Tool pages
│   └── api/               # API routes
├── components/             # React components
│   ├── ui/                # Shadcn/ui components
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

## Role System

- **Super Admin** - Full system control
- **Admin** - Content moderation, user verification
- **Verified Tester** - Professional testing, detailed reports
- **Vendor** - Tool management, analytics
- **User** - Reviews, discussions, tool discovery

## API Endpoints

### Core APIs
- `/api/tools/` - Tool management
- `/api/users/` - User management
- `/api/community/` - Reviews, discussions
- `/api/admin/` - Admin functions
- `/api/testing/` - Testing reports
- `/api/vendor/` - Vendor features

### Authentication
- Stack Auth integration
- Role-based access control
- JWT token management

## Database Schema

### Key Tables
- `users` - User profiles and roles
- `tools` - SaaS tools
- `reviews` - User reviews
- `testing_reports` - Professional test reports
- `discussions` - Community discussions
- `bookmarks` - User bookmarks

## Performance

- **Bundle Size** - 9.76 kB homepage, 320 kB shared JS
- **Optimizations** - Dynamic imports, code splitting, API caching
- **SEO** - Dynamic metadata, structured data, sitemaps
- **Monitoring** - Core Web Vitals tracking

## Development

### Scripts
```bash
bun run dev          # Development server
bun run build        # Production build
bun run lint         # ESLint
bun run type-check   # TypeScript check
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema changes
bun run analyze      # Bundle analysis
```

### Environment Variables
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Deployment

Ready for **Vercel**, **Netlify**, **Railway**, or **DigitalOcean**.

## License

MIT License
