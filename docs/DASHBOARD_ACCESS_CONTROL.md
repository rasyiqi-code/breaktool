# Dashboard Access Control System

## Overview

Sistem akses kontrol dashboard telah diimplementasikan untuk memastikan bahwa setiap dashboard hanya bisa diakses oleh user yang berhak sesuai dengan role mereka.

## Components

### 1. RequireAuth Component
- **File**: `src/components/require-auth.tsx`
- **Purpose**: Memastikan user sudah login sebelum mengakses halaman
- **Usage**: Digunakan untuk halaman yang memerlukan autentikasi tanpa spesifikasi role tertentu

### 2. RequireRole Component
- **File**: `src/components/auth/require-role.tsx`
- **Purpose**: Memastikan user memiliki role yang sesuai untuk mengakses halaman
- **Features**:
  - Support single role (`requiredRole`)
  - Support multiple roles (`requiredRoles`)
  - Support permission-based access (`requiredPermission`)
  - Automatic redirect jika tidak memiliki akses
  - Loading state dan error handling

## Dashboard Access Control Implementation

### 1. Super Admin Dashboard (`/super-admin`)
- **Required Role**: `super_admin`
- **Access Control**: `<RequireRole requiredRole="super_admin" redirectTo="/dashboard">`
- **Features**: Full system control dan oversight

### 2. Admin Dashboard (`/admin`)
- **Required Roles**: `admin` atau `super_admin`
- **Access Control**: `<RequireRole requiredRoles={['admin', 'super_admin']} redirectTo="/dashboard">`
- **Features**: Content moderation dan testing capabilities

### 3. Tester Dashboard (`/tester`)
- **Required Role**: `verified_tester`
- **Access Control**: `<RequireRole requiredRole="verified_tester" redirectTo="/dashboard">`
- **Features**: Testing tasks dan review management

### 4. Vendor Dashboard (`/vendor-dashboard`)
- **Required Role**: `vendor`
- **Access Control**: `<RequireRole requiredRole="vendor" redirectTo="/dashboard">`
- **Features**: Tool management dan vendor analytics

### 5. User Dashboard (`/dashboard`)
- **Required**: Authentication only
- **Access Control**: `<RequireAuth redirectTo="/auth/sign-in">`
- **Features**: Personal dashboard dan community features

## Role Hierarchy

```
super_admin > admin > verified_tester > vendor > user
```

### Role Permissions

#### Super Admin
- Akses ke semua dashboard
- Full system control
- User management
- Role management

#### Admin
- Akses ke admin dashboard
- Content moderation
- Testing capabilities
- User verification

#### Verified Tester
- Akses ke tester dashboard
- Testing tasks
- Review management
- Premium tools access

#### Vendor
- Akses ke vendor dashboard
- Tool management
- Vendor analytics
- Featured placement

#### User
- Akses ke user dashboard
- Basic features
- Community participation
- Review creation

## Implementation Details

### 1. Automatic Role Fetching
- Component secara otomatis fetch user role dari API
- Fallback ke role 'user' jika terjadi error
- Loading state selama proses fetch

### 2. Redirect Logic
- User tanpa akses akan di-redirect ke halaman yang sesuai
- Default redirect ke `/dashboard`
- Custom redirect bisa diatur via prop `redirectTo`

### 3. Error Handling
- Graceful fallback untuk error cases
- User-friendly error messages
- Loading states untuk UX yang lebih baik

### 4. Multiple Role Support
- Admin dashboard bisa diakses oleh `admin` dan `super_admin`
- Fleksibilitas untuk role yang overlap
- Array-based role checking

## Usage Examples

### Basic Role Check
```tsx
<RequireRole requiredRole="admin" redirectTo="/dashboard">
  <AdminContent />
</RequireRole>
```

### Multiple Roles Check
```tsx
<RequireRole requiredRoles={['admin', 'super_admin']} redirectTo="/dashboard">
  <AdminContent />
</RequireRole>
```

### Permission-based Check
```tsx
<RequireRole requiredPermission="admin:access" redirectTo="/dashboard">
  <AdminContent />
</RequireRole>
```

### Authentication Only
```tsx
<RequireAuth redirectTo="/auth/sign-in">
  <ProtectedContent />
</RequireAuth>
```

## Security Features

1. **Server-side Validation**: Role checking dilakukan di client dan server
2. **Automatic Redirects**: User tanpa akses otomatis di-redirect
3. **Role Persistence**: Role disimpan dan divalidasi setiap kali akses
4. **Fallback Protection**: Default role 'user' jika terjadi error
5. **Loading States**: Mencegah flash content sebelum role check selesai

## Best Practices

1. **Always Wrap Protected Content**: Gunakan RequireRole/RequireAuth untuk semua halaman yang memerlukan akses kontrol
2. **Provide Meaningful Redirects**: Redirect user ke halaman yang sesuai dengan role mereka
3. **Handle Loading States**: Tampilkan loading indicator selama role check
4. **Graceful Error Handling**: Fallback ke role default jika terjadi error
5. **Consistent Implementation**: Gunakan pattern yang sama di semua dashboard

## Future Enhancements

1. **Caching**: Cache user role untuk performance yang lebih baik
2. **Real-time Updates**: Update role secara real-time jika ada perubahan
3. **Advanced Permissions**: Support untuk permission-based access control yang lebih granular
4. **Audit Logging**: Log semua akses ke dashboard untuk security monitoring
5. **Role Inheritance**: Support untuk role inheritance dan role groups
