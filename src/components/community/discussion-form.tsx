'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface DiscussionFormProps {
  toolId: string
  toolName?: string
  onSubmit: (data: { title: string; content: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DiscussionForm({ 
  toolName, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: DiscussionFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate form
    const newErrors: { title?: string; content?: string } = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required'
    } else if (content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters'
    } else if (content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      await onSubmit({ title: title.trim(), content: content.trim() })
      // Reset form on success
      setTitle('')
      setContent('')
    } catch (error) {
      console.error('Error submitting discussion:', error)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Start a Discussion</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {toolName && (
          <p className="text-sm text-muted-foreground">
            Share your thoughts, ask questions, or start a conversation about {toolName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
              className={errors.title ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide details..."
              rows={6}
              className={errors.content ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
            <div className="text-xs text-muted-foreground text-right">
              {content.length}/5000 characters
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
