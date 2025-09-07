# 🚀 Breaktool - SaaS Review Platform

**Tagline:** *Discover. Test. Decide. The most trusted SaaS review platform, by testers you can trust.*

A comprehensive SaaS review platform that combines professional expert reviews with verified tester networks to provide trustworthy, in-depth analysis of SaaS tools.

## ✨ Key Features

- 🔍 **Advanced Tool Discovery** - Find and compare SaaS tools with intelligent search
- 📝 **Structured Reviews** - Comprehensive review system with Value, Usage, and Integration scoring
- 🧪 **Verified Testing** - Professional testing framework with verified testers
- 👥 **Community Driven** - Active discussions and community feedback
- 🛡️ **Role-Based Access** - Multi-role system (Admin, Tester, Vendor, User)
- 📊 **Analytics & Insights** - Detailed analytics for tools, reviews, and user engagement
- 🎯 **SEO Optimized** - Full SEO implementation with structured data and sitemaps

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - App Router, Server Components, Dynamic Rendering
- **React 18** - Hooks, Context, State Management
- **TypeScript** - Full type safety and IntelliSense
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality component library

### Backend & Database
- **Prisma ORM** - Type-safe database client
- **Supabase** - Managed PostgreSQL with real-time capabilities
- **Next.js API Routes** - RESTful endpoints with caching and error handling

### Authentication & Performance
- **Stack Auth** - Modern authentication system
- **Role-based Access Control** - Granular permissions
- **Performance Monitoring** - Core Web Vitals tracking
- **API Caching** - In-memory caching for better performance

## 🚀 Quick Start

### Prerequisites
- **Bun** (recommended) or **Node.js 18+**
- **Git**
- **Supabase account** (free tier available)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd breaktool

# Install dependencies
bun install

# Setup environment variables
cp ENVIRONMENT .env.local
# Edit .env.local with your Supabase credentials

# Setup database
bun run db:generate
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes by role
│   ├── (tools)/           # Tool-related routes
│   └── api/               # API endpoints
├── components/             # Reusable components
│   ├── ui/                # Shadcn/ui components
│   ├── reviews/           # Review components
│   ├── community/         # Community components
│   ├── seo/               # SEO components
│   └── performance/       # Performance monitoring
├── lib/                    # Utilities and services
│   ├── services/          # Business logic services
│   ├── cache/             # Caching utilities
│   └── auth/              # Authentication utilities
├── types/                  # TypeScript definitions
└── utils/                  # Helper functions
```

## 🎯 Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript check

# Database
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema changes
bun run db:studio    # Open database GUI

# Analysis
bun run analyze      # Analyze bundle size
bun run build:analyze # Build with bundle analysis
```

## 🔐 Role System

### 🛡️ Super Admin
- Full system control and oversight
- User and role management
- System configuration

### 🛡️ Admin
- Content moderation
- Testing capabilities
- User verification

### ✅ Verified Tester
- Professional testing tasks
- Detailed testing reports
- Premium tool access

### 🏢 Vendor
- Tool management
- Analytics dashboard
- Community engagement

### 👤 User
- Review and discussion participation
- Tool discovery
- Community features

## 📊 Performance Features

- ✅ **Bundle Analysis** - Optimized JavaScript bundles
- ✅ **Image Optimization** - WebP/AVIF with lazy loading
- ✅ **API Caching** - In-memory caching system
- ✅ **Database Optimization** - Indexed queries and connection pooling
- ✅ **SEO Implementation** - Dynamic metadata, structured data, sitemaps
- ✅ **Security Headers** - Comprehensive security configuration
- ✅ **Error Handling** - React Error Boundaries and graceful fallbacks

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- [**README.md**](./docs/README.md) - Complete project documentation
- [**API Structure**](./docs/API_STRUCTURE.md) - API endpoints and structure
- [**Performance Optimization**](./docs/PERFORMANCE_OPTIMIZATION.md) - Performance features
- [**SEO Implementation**](./docs/SEO_IMPLEMENTATION.md) - SEO features and configuration
- [**Multi-Role System**](./docs/MULTI_ROLE_SYSTEM.md) - Role-based access control
- [**Database Setup**](./docs/PRISMA_SUPABASE_SETUP.md) - Database configuration

## 🚀 Deployment

The application is ready for deployment to platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

### Environment Variables

Required environment variables:
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Trust Score System** - User reputation calculation
- [ ] **Real-time Features** - WebSocket integration
- [ ] **AI-powered Search** - Intelligent tool recommendations
- [ ] **Advanced Analytics** - Business intelligence tools
- [ ] **Mobile App** - React Native application

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API structure and examples

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
