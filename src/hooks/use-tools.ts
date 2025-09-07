// Tools Hook
"use client"

import { useState, useEffect } from 'react'
import { Tool, Category } from '@/types/app'


export function useTools() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTools()
    fetchCategories()
  }, [])

  const fetchTools = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tools?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch tools')
      }
      const data = await response.json()
      setTools(data.tools || [])
    } catch (err) {
      setError('Failed to fetch tools')
      console.error('Error fetching tools:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data.categories)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const getToolBySlug = async (slug: string) => {
    try {
      const response = await fetch(`/api/tools/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tool')
      }
      return await response.json()
    } catch (err) {
      console.error('Error fetching tool by slug:', err)
      throw err
    }
  }

  const searchTools = async (query: string) => {
    try {
      const response = await fetch(`/api/tools?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search tools')
      }
      return await response.json()
    } catch (err) {
      console.error('Error searching tools:', err)
      throw err
    }
  }

  return {
    tools,
    categories,
    loading,
    error,
    fetchTools,
    getToolBySlug,
    searchTools,
  }
}
