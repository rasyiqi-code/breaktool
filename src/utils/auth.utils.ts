// Auth Utilities
import { createSupabaseClient } from '@/utils/supabase-client'

export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

export async function syncUserToSupabase(userData: {
  userId: string
  email: string
  name: string
  avatar_url?: string
}): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userData.userId,
        email: userData.email,
        display_name: userData.name,
        avatar_url: userData.avatar_url,
        role: 'user',
        trust_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    return !error
  } catch (error) {
    console.error('Error syncing user to Supabase:', error)
    return false
  }
}

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['all'],
    admin: ['moderate', 'manage_users', 'manage_tools', 'write_reviews', 'create_discussions'],
    vendor: ['vendor_access', 'manage_own_tools', 'vendor_analytics', 'write_reviews', 'create_discussions'],
    moderator: ['moderate', 'manage_users', 'manage_tools'],
    verified_tester: ['write_reviews', 'create_discussions'],
    user: ['write_reviews', 'create_discussions']
  }

  const permissions = rolePermissions[userRole] || []
  return permissions.includes('all') || permissions.includes(permission)
}

export function canAccessAdmin(userRole: string): boolean {
  return ['admin', 'super_admin', 'moderator'].includes(userRole)
}
