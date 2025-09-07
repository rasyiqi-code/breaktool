# Database Setup Instructions

## Step 1: Fix RLS Issues (CRITICAL)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `umqzlbvxrcpconuvwhzh`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run Emergency Fix**
   - Copy and paste the entire content of `database/emergency-fix-users-rls.sql`
   - Click "Run" to execute

## Step 2: Set Up Database Tables

1. **Run Fresh Start Script**
   - Copy and paste the entire content of `database/1-FRESH-START.sql`
   - Click "Run" to execute

2. **Run Functions Script**
   - Copy and paste the entire content of `database/2-functions.sql`
   - Click "Run" to execute

3. **Insert Sample Data**
   - Copy and paste the entire content of `database/3-sample-data.sql`
   - Click "Run" to execute

## Step 3: Test the Setup

1. **Test Database Connection**
   - Visit: http://localhost:3000/api/test-db
   - You should see a JSON response with tools, categories, and users data

2. **Test Tools Page**
   - Visit: http://localhost:3000/tools
   - You should see a list of tools

3. **Test Tool Detail Page**
   - Visit: http://localhost:3000/tools/figma
   - You should see the Figma tool details

## Expected Results

After successful setup:
- ✅ `/api/test-db` shows tools count > 0
- ✅ `/tools` page loads with tool cards
- ✅ `/tools/figma` shows tool details
- ✅ No console errors in browser

## Troubleshooting

### If you get "relation does not exist" errors:
- Make sure you ran the scripts in the correct order
- Check that all tables were created successfully

### If you get RLS errors:
- Make sure you ran the emergency fix script first
- The users table should have RLS disabled

### If tools page is empty:
- Check that sample data was inserted successfully
- Verify the tools table has data in Supabase dashboard

## Sample Tools Available

After setup, these tools should be available:
- Figma (slug: figma)
- Canva (slug: canva)
- Notion (slug: notion)
- Asana (slug: asana)
- And more...

## Next Steps

Once the database is working:
1. The discussions page has been removed (as requested)
2. Tool detail pages should work properly
3. You can start adding more tools and features
