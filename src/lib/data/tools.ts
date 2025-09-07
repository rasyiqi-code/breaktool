import { supabase } from '@/lib/supabase'
import { Category, ToolWithCategory } from '@/types/database'

export async function getTools(params?: {
  limit?: number
  featured?: boolean
  category?: string
}): Promise<ToolWithCategory[]> {
  try {
    let query = supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('upvotes', { ascending: false })

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    if (params?.featured !== undefined) {
      query = query.eq('featured', params.featured)
    }

    if (params?.category) {
      query = query.eq('category.slug', params.category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tools:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTools:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCategories:', error)
    return []
  }
}

export async function getToolBySlug(slug: string): Promise<ToolWithCategory | null> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching tool:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getToolBySlug:', error)
    return null
  }
}

export async function getFeaturedTools(): Promise<ToolWithCategory[]> {
  return getTools({ featured: true, limit: 6 })
}

export async function getTrendingTools(): Promise<ToolWithCategory[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching trending tools:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTrendingTools:', error)
    return []
  }
}

export async function getRecentTools(): Promise<ToolWithCategory[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching recent tools:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getRecentTools:', error)
    return []
  }
}
