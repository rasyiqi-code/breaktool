import { prisma } from '@/lib/prisma'
import type { Category } from '@/types/app'

export class CategoriesService {
  // Get all categories
  static async getCategories(): Promise<Category[]> {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      })

      return categories as unknown as Category[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { id }
      })

      return category as unknown as Category
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { slug }
      })

      return category as unknown as Category
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Create new category
  static async createCategory(data: {
    name: string
    slug: string
    description?: string
    icon?: string
    color?: string
  }): Promise<Category> {
    try {
      const category = await prisma.category.create({
        data
      })

      return category as unknown as Category
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Update category
  static async updateCategory(
    id: string,
    data: Partial<{
      name: string
      slug: string
      description: string
      icon: string
      color: string
    }>
  ): Promise<Category> {
    try {
      const category = await prisma.category.update({
        where: { id },
        data
      })

      return category as unknown as Category
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Delete category
  static async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.category.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }
}
