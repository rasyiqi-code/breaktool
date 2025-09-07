import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Default Supabase client (for public data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Note: Server-side authentication functions moved to stack-server.ts
// This file is client-safe and only provides basic Supabase client

// Note: Admin client moved to stack-server.ts
// This file is client-safe and only provides basic Supabase client
