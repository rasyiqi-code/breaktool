import { NextResponse } from 'next/server'
import { CategoriesService } from '@/lib/services/tools/categories.service'

export async function GET() {
  try {
    const categories = await CategoriesService.getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
