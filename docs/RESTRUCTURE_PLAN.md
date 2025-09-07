# 🏗️ RESTRUCTURE PLAN - Breaktool Project

## 📋 **Current Problems:**
1. **App Router Structure** - Tidak konsisten, banyak direktori kosong
2. **Components** - Tidak modular, navigation.tsx terlalu besar
3. **Services** - Tidak terorganisir berdasarkan domain
4. **Types** - Tersebar di multiple locations
5. **Features** - Tidak ada clear separation of concerns

## 🎯 **Target Structure:**

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── profile/
│   ├── (dashboard)/              # Dashboard routes group
│   │   ├── admin/
│   │   ├── vendor/
│   │   └── user/
│   ├── (tools)/                  # Tools related routes
│   │   ├── tools/
│   │   ├── compare/
│   │   ├── submit/
│   │   └── [slug]/
│   ├── (community)/              # Community features
│   │   ├── discussions/
│   │   ├── notifications/
│   │   └── bookmarks/
│   ├── (marketing)/              # Marketing features
│   │   ├── featured-placement/
│   │   └── subscription/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── tools/
│   │   ├── reviews/
│   │   ├── discussions/
│   │   ├── admin/
│   │   └── vendor/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── navigation/
│   │   │   ├── main-nav.tsx
│   │   │   ├── user-menu.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   ├── tools/                    # Tool-related components
│   │   ├── tool-card.tsx
│   │   ├── tool-list.tsx
│   │   ├── tool-form.tsx
│   │   └── tool-comparison.tsx
│   ├── reviews/                  # Review components
│   │   ├── review-card.tsx
│   │   ├── review-form.tsx
│   │   └── review-list.tsx
│   ├── community/                # Community components
│   │   ├── discussion-list.tsx
│   │   ├── discussion-form.tsx
│   │   └── notifications-list.tsx
│   ├── admin/                    # Admin components
│   │   ├── user-management.tsx
│   │   ├── tool-management.tsx
│   │   └── analytics-dashboard.tsx
│   └── vendor/                   # Vendor components
│       ├── submission-form.tsx
│       ├── stats-dashboard.tsx
│       └── campaign-manager.tsx
├── lib/                          # Core libraries
│   ├── config/                   # Configuration
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   └── constants.ts
│   ├── services/                 # Business logic services
│   │   ├── tools/
│   │   │   ├── tools.service.ts
│   │   │   ├── categories.service.ts
│   │   │   └── types.ts
│   │   ├── reviews/
│   │   │   ├── reviews.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── types.ts
│   │   ├── community/
│   │   │   ├── discussions.service.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── types.ts
│   │   ├── admin/
│   │   │   ├── users.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── types.ts
│   │   └── vendor/
│   │       ├── submissions.service.ts
│   │       ├── stats.service.ts
│   │       └── types.ts
│   ├── utils/                    # Utility functions
│   │   ├── auth.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── formatting.utils.ts
│   │   └── api.utils.ts
│   └── hooks/                    # Custom hooks
│       ├── use-auth.ts
│       ├── use-tools.ts
│       ├── use-reviews.ts
│       └── use-notifications.ts
├── types/                        # Global type definitions
│   ├── auth.types.ts
│   ├── tools.types.ts
│   ├── reviews.types.ts
│   ├── community.types.ts
│   ├── admin.types.ts
│   └── vendor.types.ts
└── styles/                       # Global styles
    ├── globals.css
    ├── components.css
    └── utilities.css
```

## 🔄 **Migration Steps:**

### Phase 1: Clean Up
1. **Remove unused directories**
   - Delete empty directories
   - Remove deleted feature directories

### Phase 2: Reorganize Components
1. **Split navigation.tsx**
   - Extract main navigation
   - Extract user menu
   - Extract mobile navigation

2. **Group components by domain**
   - Move tool components to `components/tools/`
   - Move review components to `components/reviews/`
   - Move community components to `components/community/`

### Phase 3: Reorganize Services
1. **Group services by domain**
   - Create domain-specific service directories
   - Move related services together

2. **Consolidate types**
   - Move all types to `src/types/`
   - Create domain-specific type files

### Phase 4: Reorganize App Router
1. **Group routes by feature**
   - Create route groups with parentheses
   - Organize by domain/feature

### Phase 5: Update Imports
1. **Update all import paths**
   - Fix broken imports after restructuring
   - Update relative paths

## 📊 **Benefits After Restructuring:**

### ✅ **Modularity**
- Clear separation of concerns
- Domain-specific organization
- Easier to maintain and scale

### ✅ **Maintainability**
- Smaller, focused components
- Organized business logic
- Clear file structure

### ✅ **Scalability**
- Easy to add new features
- Clear patterns to follow
- Better team collaboration

### ✅ **Performance**
- Better code splitting
- Optimized imports
- Reduced bundle size

## 🎯 **Next Steps:**
1. Create backup of current structure
2. Start with Phase 1 (Clean Up)
3. Gradually migrate components
4. Update imports systematically
5. Test thoroughly after each phase
