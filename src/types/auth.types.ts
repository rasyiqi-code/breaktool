// Auth Types
export interface AuthUser {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthPermissions {
  can_access_admin: boolean
  can_moderate: boolean
  can_submit_tools: boolean
  can_write_reviews: boolean
  can_create_discussions: boolean
}

export interface AuthRole {
  id: string
  name: string
  description: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface AuthProvider {
  id: string
  name: string
  provider_type: 'oauth' | 'email' | 'magic_link'
  is_enabled: boolean
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}
