# 🎭 Multi-Role System Documentation

## 📋 Overview

Sistem Multi-Role memungkinkan user untuk memiliki multiple roles (tester, vendor, admin, dll) dan dapat switch antar role dengan mudah. Ini memberikan fleksibilitas maksimal untuk user yang ingin explore berbagai fitur platform.

## 🏗️ Architecture

### Database Schema

```sql
-- User Roles Table (Many-to-Many)
CREATE TABLE user_roles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);

-- Updated Users Table
ALTER TABLE users ADD COLUMN primary_role VARCHAR(50);
ALTER TABLE users ADD COLUMN active_role VARCHAR(50);
ALTER TABLE users ADD COLUMN role_switched_at TIMESTAMP;
```

### Prisma Models

```prisma
model User {
  id                   String                @id
  email                String                @unique
  name                 String?
  role                 String                @default("user") // Legacy field
  primaryRole          String?               @map("primary_role")
  activeRole           String?               @map("active_role")
  roleSwitchedAt       DateTime?             @map("role_switched_at")
  // ... other fields
  userRoles            UserRole[]
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  role      String   @db.VarChar(50)
  isActive  Boolean  @default(true) @map("is_active")
  grantedAt DateTime @default(now()) @map("granted_at")
  grantedBy String?  @map("granted_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, role])
  @@index([userId])
  @@index([role])
  @@index([isActive])
  @@index([grantedAt])
  @@map("user_roles")
}
```

## 🔧 API Endpoints

### 1. Role Switching

#### GET `/api/users/switch-role`
Get current user's roles and active role.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "primaryRole": "verified_tester",
    "activeRole": "vendor",
    "userRoles": [
      {
        "id": "role1",
        "role": "verified_tester",
        "isActive": true,
        "grantedAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": "role2", 
        "role": "vendor",
        "isActive": true,
        "grantedAt": "2024-01-15T00:00:00Z"
      }
    ]
  }
}
```

#### POST `/api/users/switch-role`
Switch user's active role.

**Request:**
```json
{
  "role": "vendor"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully switched to vendor role",
  "user": { /* updated user object */ }
}
```

### 2. Role Application

#### POST `/api/users/apply-role`
Apply for a new role (tester or vendor).

**Request:**
```json
{
  "targetRole": "vendor",
  "applicationData": {
    "company_name": "My Company",
    "company_size": "10-50",
    "industry": "Technology",
    "website_url": "https://mycompany.com",
    "linkedin_url": "https://linkedin.com/company/mycompany",
    "company_description": "We build amazing tools",
    "products_services": "SaaS Platform",
    "target_audience": "Small businesses",
    "business_model": "Subscription (SaaS)",
    "motivation": "Want to showcase our tools"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor application submitted successfully",
  "applicationId": "app123",
  "status": "pending"
}
```

### 3. Admin Role Management

#### GET `/api/admin/users/[id]/roles`
Get user's roles (admin only).

#### POST `/api/admin/users/[id]/roles`
Grant or revoke roles (admin only).

**Request:**
```json
{
  "role": "vendor",
  "action": "grant" // or "revoke"
}
```

## 🎨 UI Components

### RoleSwitcher Component

```tsx
import { RoleSwitcher } from '@/components/auth/role-switcher';

// Dropdown variant (default)
<RoleSwitcher variant="dropdown" size="sm" />

// Button variant
<RoleSwitcher variant="buttons" size="md" />

// Select variant
<RoleSwitcher variant="select" size="lg" />
```

**Props:**
- `variant`: 'dropdown' | 'select' | 'buttons'
- `size`: 'sm' | 'md' | 'lg'
- `showCurrentRole`: boolean
- `className`: string

### useMultiRole Hook

```tsx
import { useMultiRole } from '@/hooks/use-multi-role';

function MyComponent() {
  const { 
    user, 
    activeRole, 
    availableRoles, 
    isLoading, 
    switchRole, 
    hasRole, 
    hasAnyRole,
    refreshUser 
  } = useMultiRole();

  // Check if user has specific role
  if (hasRole('vendor')) {
    // Show vendor features
  }

  // Check if user has any of multiple roles
  if (hasAnyRole(['admin', 'super_admin'])) {
    // Show admin features
  }

  // Switch role
  const handleSwitch = async () => {
    const success = await switchRole('vendor');
    if (success) {
      console.log('Role switched successfully');
    }
  };
}
```

### useRoleAccess Hook

```tsx
import { useRoleAccess } from '@/hooks/use-multi-role';

function ProtectedComponent() {
  const { hasAccess, isLoading, user, activeRole } = useRoleAccess(
    ['admin', 'super_admin'], // Required roles
    '/dashboard' // Redirect if no access
  );

  if (isLoading) return <div>Loading...</div>;
  if (!hasAccess) return <div>Access denied</div>;

  return <div>Admin content</div>;
}
```

## 🔄 User Workflows

### 1. Tester → Vendor

1. **User** dengan role `verified_tester` mengunjungi `/apply-vendor`
2. **Fill form** vendor application
3. **Submit application** → Status: `pending`
4. **Admin review** dan approve application
5. **User mendapat role** `vendor` tambahan
6. **Role Switcher** muncul di UI
7. **User bisa switch** antara "Tester Mode" dan "Vendor Mode"

### 2. Vendor → Tester

1. **User** dengan role `vendor` apply untuk `verified_tester`
2. **Submit verification request**
3. **Admin review** dan approve
4. **User mendapat role** `verified_tester` tambahan
5. **Role Switcher** update dengan role baru
6. **User bisa switch** antara "Vendor Mode" dan "Tester Mode"

### 3. Role Switching

1. **User** dengan multiple roles melihat **Role Switcher** di header
2. **Click dropdown** untuk melihat available roles
3. **Select role** yang diinginkan
4. **System switch** active role
5. **UI update** sesuai dengan active role
6. **Navigation** berubah sesuai role

## 🎯 Role Permissions

### Role Hierarchy
```
super_admin > admin > verified_tester > vendor > user
```

### Dashboard Access
- **Super Admin**: `/super-admin` - Full system control
- **Admin**: `/admin` - Content moderation & testing
- **Verified Tester**: `/tester` - Testing tasks & reviews
- **Vendor**: `/vendor-dashboard` - Tool management & analytics
- **User**: `/dashboard` - Personal dashboard

### Feature Access
- **Testing Reports**: `verified_tester`, `admin`, `super_admin`
- **Vendor Tools**: `vendor`, `admin`, `super_admin`
- **User Management**: `admin`, `super_admin`
- **System Settings**: `super_admin` only

## 🔧 Service Layer

### RoleManagementService

```typescript
import { RoleManagementService } from '@/lib/services/users/role-management.service';

// Get user with all roles
const user = await RoleManagementService.getUserWithRoles(userId);

// Get available roles
const roles = await RoleManagementService.getUserAvailableRoles(userId);

// Switch role
await RoleManagementService.switchUserRole(userId, 'vendor');

// Grant role
await RoleManagementService.grantRoleToUser(userId, 'vendor', adminId);

// Revoke role
await RoleManagementService.revokeRoleFromUser(userId, 'vendor');

// Check role
const hasRole = await RoleManagementService.userHasRole(userId, 'vendor');
```

## 🚀 Migration Guide

### From Single Role to Multi-Role

1. **Run migration script:**
```bash
bun run scripts/migrate-to-multi-role.ts
```

2. **Update existing code:**
```typescript
// Old way
const userRole = user.role;

// New way
const { activeRole, hasRole } = useMultiRole();
const userRole = activeRole;
```

3. **Update role checks:**
```typescript
// Old way
if (user.role === 'admin') { ... }

// New way
if (hasRole('admin')) { ... }
```

## 🧪 Testing

### Test Scripts

```bash
# Test multi-role system
bun run scripts/test-multi-role.ts

# Test role switching
bun run scripts/test-role-switching.ts
```

### Manual Testing

1. **Login** dengan user yang memiliki multiple roles
2. **Check Role Switcher** di header
3. **Switch roles** dan verify UI changes
4. **Test navigation** dengan different active roles
5. **Test permissions** for each role

## 📊 Monitoring & Analytics

### Key Metrics
- **Role Distribution**: How many users have each role
- **Role Switching Frequency**: How often users switch roles
- **Multi-Role Users**: Users with multiple roles
- **Application Success Rate**: Vendor/tester application approval rate

### Database Queries

```sql
-- Role distribution
SELECT role, COUNT(*) as user_count 
FROM user_roles 
WHERE is_active = true 
GROUP BY role;

-- Multi-role users
SELECT u.email, COUNT(ur.role) as role_count
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.is_active = true
GROUP BY u.id, u.email
HAVING COUNT(ur.role) > 1;

-- Role switching activity
SELECT active_role, COUNT(*) as users
FROM users 
WHERE active_role IS NOT NULL
GROUP BY active_role;
```

## 🔒 Security Considerations

1. **Role Validation**: Always validate roles on both client and server
2. **Permission Checks**: Use `hasRole()` and `hasAnyRole()` for access control
3. **Admin Actions**: Log all role grants/revokes with admin ID
4. **Rate Limiting**: Prevent abuse of role switching
5. **Session Management**: Update session when role changes

## 🐛 Troubleshooting

### Common Issues

1. **Role Switcher not showing**
   - Check if user has multiple roles
   - Verify `useMultiRole` hook is working
   - Check console for errors

2. **Role switching fails**
   - Verify user has the target role
   - Check API endpoint permissions
   - Verify database connection

3. **UI not updating after role switch**
   - Check if `activeRole` is updating
   - Verify component re-renders
   - Check navigation logic

### Debug Commands

```bash
# Check user roles in database
bun run scripts/check-user-roles.ts

# Test role switching API
curl -X POST http://localhost:3000/api/users/switch-role \
  -H "Content-Type: application/json" \
  -d '{"role": "vendor"}'

# Check role permissions
bun run scripts/check-role-permissions.ts
```

## 📈 Future Enhancements

1. **Role History**: Track role changes over time
2. **Role Expiration**: Temporary roles with expiration dates
3. **Role Delegation**: Allow users to delegate roles
4. **Role Analytics**: Advanced role usage analytics
5. **Custom Roles**: Allow creation of custom roles
6. **Role Templates**: Predefined role combinations

## 🎉 Conclusion

Sistem Multi-Role memberikan fleksibilitas maksimal untuk user dan meningkatkan engagement platform. User tidak perlu pilih antara menjadi tester atau vendor - mereka bisa menjadi keduanya dan switch sesuai kebutuhan.

**Key Benefits:**
- ✅ **User Flexibility**: No more role lock-in
- ✅ **Higher Engagement**: Users can explore all features
- ✅ **Better Retention**: No need for multiple accounts
- ✅ **Business Growth**: Cross-selling opportunities
- ✅ **Scalable**: Easy to add new roles

**Ready for Production!** 🚀
