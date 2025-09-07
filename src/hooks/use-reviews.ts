// Reviews Hook
"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@stackframe/stack'
import { ReviewWithUser } from '@/types/app'
import { ReviewsService } from '@/lib/services/reviews/reviews.service'

export function useReviews(toolId?: string) {
  const user = useUser()
  const [reviews, setReviews] = useState<ReviewWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (toolId) {
      fetchReviewsByTool(toolId)
    } else {
      fetchAllReviews()
    }
  }, [toolId])

  const fetchAllReviews = async () => {
    try {
      setLoading(true)
      const data = await ReviewsService.getAllReviews()
      setReviews(data)
    } catch (err) {
      setError('Failed to fetch reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewsByTool = async (toolId: string) => {
    try {
      setLoading(true)
      const data = await ReviewsService.getToolReviews(toolId)
      setReviews(data)
    } catch (err) {
      setError('Failed to fetch reviews')
      console.error('Error fetching reviews by tool:', err)
    } finally {
      setLoading(false)
    }
  }

  const createReview = async (reviewData: {
    tool_id: string;
    rating: number;
    title: string;
    content: string;
    pros?: string[];
    cons?: string[];
    recommendation?: string;
  }) => {
    try {
      const serviceData = {
        toolId: reviewData.tool_id,
        userId: user?.id || '',
        type: 'community',
        title: reviewData.title,
        content: reviewData.content,
        overallScore: reviewData.rating,
        pros: reviewData.pros,
        cons: reviewData.cons,
        recommendation: reviewData.recommendation
      }
      const newReview = await ReviewsService.createReview(serviceData)
      setReviews(prev => [newReview, ...prev])
      return newReview
    } catch (err) {
      console.error('Error creating review:', err)
      throw err
    }
  }

  const updateReview = async (reviewId: string, reviewData: {
    rating?: number;
    title?: string;
    content?: string;
    pros?: string[];
    cons?: string[];
    recommendation?: string;
  }) => {
    try {
      const updatedReview = await ReviewsService.updateReview(reviewId, reviewData)
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? updatedReview : review
      ))
      return updatedReview
    } catch (err) {
      console.error('Error updating review:', err)
      throw err
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      await ReviewsService.deleteReview(reviewId)
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (err) {
      console.error('Error deleting review:', err)
      throw err
    }
  }

  return {
    reviews,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    refetch: toolId ? () => fetchReviewsByTool(toolId) : fetchAllReviews,
  }
}
