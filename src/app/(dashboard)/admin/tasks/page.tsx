'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  PlayCircle,
} from 'lucide-react'
import { useRoleCheck } from '@/hooks/use-role-check'
import { RequireRole } from '@/components/auth/require-role'
import Image from 'next/image'

interface TestingTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  deadline: string
  reward: number
  createdAt: string
  tool: {
    id: string
    name: string
    slug: string
    logoUrl?: string
    category?: {
      name: string
    }
  }
  tester: {
    id: string
    name: string
    email: string
  }
}

interface TaskStats {
  total: number
  pending: number
  in_progress: number
  completed: number
  cancelled: number
}

export default function AdminTasksPage() {
  const router = useRouter()
  const { hasAccess, isLoading: roleLoading } = useRoleCheck({
    requiredRoles: ['admin', 'super_admin']
  })

  const [tasks, setTasks] = useState<TestingTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TestingTask[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedTask, setSelectedTask] = useState<TestingTask | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/testing/tester-stats/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        calculateStats(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const calculateStats = (taskList: TestingTask[]) => {
    const newStats = {
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'pending').length,
      in_progress: taskList.filter(t => t.status === 'in_progress').length,
      completed: taskList.filter(t => t.status === 'completed').length,
      cancelled: taskList.filter(t => t.status === 'cancelled').length
    }
    setStats(newStats)
  }

  const filterTasks = useCallback(() => {
    let filtered = tasks

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tester.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    setFilteredTasks(filtered)
    setCurrentPage(1)
  }, [tasks, searchTerm, statusFilter, priorityFilter])

  useEffect(() => {
    if (hasAccess) {
      fetchTasks()
    }
  }, [hasAccess, fetchTasks])

  useEffect(() => {
    filterTasks()
  }, [filterTasks])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const

    const icons = {
      pending: Clock,
      in_progress: PlayCircle,
      completed: CheckCircle,
      cancelled: AlertCircle
    }

    const Icon = icons[status as keyof typeof icons] || Clock

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className={status === 'completed' ? 'bg-green-100 text-green-800' : ''}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive'
    } as const

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getPaginatedTasks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage)
  }

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)

  const handleViewTask = (task: TestingTask) => {
    setSelectedTask(task)
    setIsViewModalOpen(true)
  }

  const handleEditTask = (task: TestingTask) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleDeleteTask = (task: TestingTask) => {
    setSelectedTask(task)
    setIsDeleteModalOpen(true)
  }

  const handleSaveEdit = async (taskData: Partial<TestingTask>) => {
    if (!selectedTask) return

    try {
      const response = await fetch(`/api/testing/tester-stats/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        await fetchTasks() // Refresh tasks
        setIsEditModalOpen(false)
        setSelectedTask(null)
      } else {
        console.error('Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedTask) return

    try {
      const response = await fetch(`/api/testing/tester-stats/tasks/${selectedTask.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTasks() // Refresh tasks
        setIsDeleteModalOpen(false)
        setSelectedTask(null)
      } else {
        console.error('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Manage and track all testing tasks</p>
          </div>
          <Button onClick={() => router.push('/admin/create-task')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Task
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tasks, tools, or testers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>
              Manage and track all testing tasks assigned to verified testers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  {tasks.length === 0 
                    ? "No testing tasks have been created yet." 
                    : "No tasks match your current filters."}
                </p>
                {tasks.length === 0 && (
                  <Button onClick={() => router.push('/admin/create-task')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {getPaginatedTasks().map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {getStatusBadge(task.status)}
                              {getPriorityBadge(task.priority)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                {task.tool.logoUrl && (
                                  <Image 
                                    src={task.tool.logoUrl} 
                                    alt={task.tool.name}
                                    width={20}
                                    height={20}
                                    className="rounded"
                                  />
                                )}
                                <span className="font-medium">{task.tool.name}</span>
                                {task.tool.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.tool.category.name}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{task.tester.name}</span>
                              <span className="text-muted-foreground">({task.tester.email})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">${task.reward}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Deadline: {formatDate(task.deadline)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Created: {formatDate(task.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewTask(task)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteTask(task)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Task Modal */}
        {isViewModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 w-full max-w-2xl mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Task Details</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b border-border pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold text-foreground">{selectedTask.title}</h2>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedTask.status)}
                      {getPriorityBadge(selectedTask.priority)}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Task Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tool Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Tool Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {selectedTask.tool.logoUrl && (
                          <Image 
                            src={selectedTask.tool.logoUrl} 
                            alt={selectedTask.tool.name}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{selectedTask.tool.name}</p>
                          {selectedTask.tool.category && (
                            <Badge variant="outline" className="text-xs">
                              {selectedTask.tool.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tester Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Tester Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{selectedTask.tester.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedTask.tester.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">Task Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Reward</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">${selectedTask.reward}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Deadline</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(selectedTask.deadline)}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Created</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(selectedTask.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleEditTask(selectedTask)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleDeleteTask(selectedTask)
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {isEditModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Edit Task</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Status</label>
                  <Select 
                    value={selectedTask.status} 
                    onValueChange={(value) => setSelectedTask({...selectedTask, status: value as 'pending' | 'in_progress' | 'completed' | 'cancelled'})}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
                      <SelectItem value="in_progress" className="text-foreground">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-foreground">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-foreground">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Priority</label>
                  <Select 
                    value={selectedTask.priority} 
                    onValueChange={(value) => setSelectedTask({...selectedTask, priority: value as 'low' | 'medium' | 'high'})}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="low" className="text-foreground">Low</SelectItem>
                      <SelectItem value="medium" className="text-foreground">Medium</SelectItem>
                      <SelectItem value="high" className="text-foreground">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Reward ($)</label>
                  <Input
                    type="number"
                    value={selectedTask.reward}
                    onChange={(e) => setSelectedTask({...selectedTask, reward: parseFloat(e.target.value) || 0})}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={() => handleSaveEdit(selectedTask)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Delete Task</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete the task &quot;{selectedTask.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  )
}
