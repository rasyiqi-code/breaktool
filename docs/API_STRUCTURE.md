# API Directory Structure

The API directory has been reorganized for better maintainability and logical grouping. Here's the new structure:

## 📁 `/api/users/` - User Management
- `get-user-with-sync/` - Get user data with sync status
- `sync-user-profile/` - Sync user profile data
- `auto-sync-user/` - Automatic user synchronization
- `check-user-exists/` - Check if user exists
- `apply-verification/` - Apply for user verification

## 📁 `/api/vendor/` - Vendor & Subscription Management
- `subscription/` - Subscription management endpoints
  - `user/` - User subscription data
  - `plans/` - Available subscription plans
  - `features/` - Subscription features
  - `limits/` - Usage limits
  - `cancel/` - Cancel subscription
- `featured-placement/` - Featured placement management
  - `submit/` - Submit for featured placement
  - `submissions/` - View submissions
  - `placements/` - Active placements
  - `stats/` - Placement statistics

## 📁 `/api/community/` - Community & Reviews
- `reviews/` - Review management
  - `create/` - Create new review
  - `vote/` - Vote on reviews
- `verdict/` - Verdict aggregation
  - `all/` - Get all verdicts
- `trust-score/` - Trust score system
  - `top-users/` - Top trusted users
- `review-analytics/` - Review analytics
  - `[id]/` - Analytics for specific review
  - `tool/[id]/` - Analytics for specific tool
  - `metrics/` - Overall metrics
- `notifications/` - User notifications
  - `[id]/` - Specific notification
  - `read-all/` - Mark all as read

## 📁 `/api/marketing/` - Marketing & Lead Generation
- `affiliate/` - Affiliate program management
  - `track/` - Track affiliate conversions
  - `stats/` - Affiliate statistics
  - `programs/` - Available programs
  - `partners/` - Partner management
  - `payouts/` - Payout management
  - `conversion/` - Conversion tracking
- `tester-contact/` - Tester contact management
- `leads/` - Lead generation and management

## 📁 `/api/analytics/` - Platform Analytics
- `tool/[id]/` - Analytics for specific tool
- `platform/` - Platform-wide analytics
- `industry/[industry]/` - Industry-specific analytics
- `comparison/` - Comparison analytics

## 📁 `/api/admin/` - Admin Management
- `analytics/` - Admin analytics
- `users/` - User management
- `tools/` - Tool management
- `recent-activity/` - Recent activity tracking
- `verifications/` - Verification management
- `submissions/` - Submission management
- `stats/` - Admin statistics

## 📁 `/api/tools/` - Tool Management
- `route.ts` - Main tools endpoint
- `compare/` - Tool comparison functionality

## 📁 `/api/webhooks/` - Webhook Endpoints
- `stack-auth/` - Stack Auth webhooks

## Benefits of This Organization:

1. **Logical Grouping**: Related endpoints are grouped together
2. **Easier Navigation**: Developers can quickly find relevant endpoints
3. **Better Maintainability**: Changes to related functionality are co-located
4. **Scalability**: New endpoints can be easily added to appropriate categories
5. **Clear Separation**: Different concerns (users, vendors, community, etc.) are separated

## Migration Notes:

- All existing endpoint URLs remain the same (Next.js App Router handles this automatically)
- No code changes required in frontend components
- Import paths in API route files remain unchanged
- The reorganization is purely structural for better organization
