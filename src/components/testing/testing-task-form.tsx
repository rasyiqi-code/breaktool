'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface TestingTaskFormData {
  toolId: string
  testerId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  deadline: Date
  reward: number
}

interface TestingTaskFormProps {
  onSubmit: (data: TestingTaskFormData) => void
  onCancel: () => void
  tools?: Array<{
    id: string
    name: string
    slug: string
    logoUrl?: string
  }>
  testers?: Array<{
    id: string
    name: string
    email: string
  }>
  isLoading?: boolean
}

export function TestingTaskForm({ onSubmit, onCancel, tools = [], testers = [], isLoading = false }: TestingTaskFormProps) {
  const [formData, setFormData] = useState<TestingTaskFormData>({
    toolId: '',
    testerId: '',
    title: '',
    description: '',
    priority: 'medium',
    deadline: new Date(),
    reward: 0
  })

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const handleInputChange = (field: keyof TestingTaskFormData, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.toolId) newErrors.toolId = 'Please select a tool'
    if (!formData.testerId) newErrors.testerId = 'Please select a tester'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.reward < 0) newErrors.reward = 'Reward must be positive'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>+ Create Testing Task</CardTitle>
        <CardDescription>
          Assign a new testing task to a verified tester
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tool Selection */}
          <div className="space-y-2">
            <Label htmlFor="tool">Tool to Test *</Label>
            <Select
              value={formData.toolId}
              onValueChange={(value) => handleInputChange('toolId', value)}
            >
              <SelectTrigger className={cn(errors.toolId && 'border-red-500')}>
                <SelectValue placeholder="Select a tool to test" />
              </SelectTrigger>
              <SelectContent>
                {tools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    <div className="flex items-center gap-2">
                      {tool.logoUrl && (
                        <Image src={tool.logoUrl} alt={tool.name} width={16} height={16} className="w-4 h-4 rounded" />
                      )}
                      {tool.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.toolId && <p className="text-sm text-red-500">{errors.toolId}</p>}
          </div>

          {/* Tester Selection */}
          <div className="space-y-2">
            <Label htmlFor="tester">Assign to Tester *</Label>
            <Select
              value={formData.testerId}
              onValueChange={(value) => handleInputChange('testerId', value)}
            >
              <SelectTrigger className={cn(errors.testerId && 'border-red-500')}>
                <SelectValue placeholder="Select a verified tester" />
              </SelectTrigger>
              <SelectContent>
                {testers.map((tester) => (
                  <SelectItem key={tester.id} value={tester.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{tester.name}</span>
                      <span className="text-sm text-muted-foreground">{tester.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.testerId && <p className="text-sm text-red-500">{errors.testerId}</p>}
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Comprehensive Notion Testing"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what needs to be tested..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={cn(errors.description && 'border-red-500')}
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Priority and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={formData.deadline ? formData.deadline.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date()
                  handleInputChange('deadline', date)
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Reward */}
          <div className="space-y-2">
            <Label htmlFor="reward">Reward ($)</Label>
            <Input
              id="reward"
              type="number"
              min="0"
              step="0.01"
              value={formData.reward}
              onChange={(e) => handleInputChange('reward', parseFloat(e.target.value) || 0)}
              className={cn(errors.reward && 'border-red-500')}
            />
            {errors.reward && <p className="text-sm text-red-500">{errors.reward}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}