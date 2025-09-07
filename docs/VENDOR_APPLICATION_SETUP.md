# Vendor Application Setup Guide

## Overview
This guide explains how to set up the new Vendor Application feature that replaces the temporary solution.

## What's New
- **New Database Table**: `vendor_applications` for storing vendor applications
- **New User Fields**: `vendor_status`, `vendor_approved_at`, `vendor_approved_by` in users table
- **Proper API Endpoints**: Using the new database structure instead of temporary bio field parsing

## Setup Steps

### 1. Run Database Migration
```sql
-- Run the migration file: prisma/migrations/add_vendor_application.sql
-- This will:
-- - Add vendor status fields to users table
-- - Create vendor_applications table
-- - Add proper indexes and foreign keys
```

### 2. Generate Prisma Client
```bash
# After running the migration, generate the Prisma client
bun run prisma generate
# or
npx prisma generate
```

### 3. Restart Development Server
```bash
bun run dev
```

## Database Schema Changes

### Users Table
```sql
ALTER TABLE users ADD COLUMN vendor_status VARCHAR(50);
ALTER TABLE users ADD COLUMN vendor_approved_at TIMESTAMP;
ALTER TABLE users ADD COLUMN vendor_approved_by VARCHAR(255);
```

### New VendorApplications Table
```sql
CREATE TABLE vendor_applications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_size VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  linkedin_url VARCHAR(500),
  company_description TEXT NOT NULL,
  products_services TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  business_model VARCHAR(255) NOT NULL,
  motivation TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features

### 1. User Application Flow
- Users can apply for vendor status
- Applications are stored in proper database table
- User's vendor status is tracked

### 2. Admin Management
- Admin dashboard shows pending vendor applications
- Admins can approve/reject applications
- Review notes are stored properly

### 3. Status Tracking
- `pending`: Application submitted, waiting for review
- `approved`: Application approved, user becomes vendor
- `rejected`: Application rejected, user can reapply

## API Endpoints

### POST /api/users/apply-vendor
- Creates new vendor application
- Updates user's vendor status to 'pending'

### GET /api/users/apply-vendor?userId={id}
- Returns existing vendor application status
- Checks both vendor role and application status

### GET /api/admin/vendor-applications
- Returns all pending vendor applications
- Used by admin dashboard

### PATCH /api/admin/users/{id}/vendor-approval
- Approves/rejects vendor applications
- Updates both user role and application status

## Migration from Temporary Solution

The old temporary solution stored vendor application data in the user's `bio` field. The new system:

1. **Stores data properly** in dedicated `vendor_applications` table
2. **Tracks status** in user's `vendor_status` field
3. **Provides proper relationships** between users and applications
4. **Enables better querying** and reporting

## Troubleshooting

### Prisma Generate Permission Error
If you get permission errors when running `prisma generate`:
1. Close any running processes
2. Run PowerShell as Administrator
3. Try again: `npx prisma generate`

### Database Connection Issues
Ensure your `.env` file has the correct `DATABASE_URL` and `DIRECT_URL` values.

## Next Steps

After setup:
1. Test vendor application submission
2. Test admin approval/rejection flow
3. Verify data is stored correctly in new tables
4. Remove any temporary code that used bio field parsing
