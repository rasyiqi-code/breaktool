'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  Calendar,
  DollarSign
} from 'lucide-react';
import Image from 'next/image';

interface TestingTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  reward: number;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    category?: {
      name: string;
    };
  };
}

interface TestingTaskCardProps {
  task: TestingTask;
  onStart?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onView?: (taskId: string) => void;
}

export function TestingTaskCard({ task, onStart, onComplete, onView }: TestingTaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysRemaining = () => {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {task.tool.logoUrl ? (
              <Image 
                src={task.tool.logoUrl} 
                alt={task.tool.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-md object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                <Star className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{task.tool.name}</span>
                {task.tool.category && (
                  <>
                    <span>•</span>
                    <span>{task.tool.category.name}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
              {task.status === 'in_progress' && <Play className="w-3 h-3 mr-1" />}
              {task.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                 isDueSoon ? `${daysRemaining} days left` : 
                 `${daysRemaining} days left`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">${task.reward}</span>
            </div>
          </div>
          
          {isOverdue && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {task.status === 'pending' && onStart && (
            <Button 
              size="sm" 
              onClick={() => onStart(task.id)}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Test
            </Button>
          )}
          
          {task.status === 'in_progress' && onComplete && (
            <Button 
              size="sm" 
              onClick={() => onComplete(task.id)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Test
            </Button>
          )}
          
          {task.status === 'completed' && onView && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onView(task.id)}
              className="flex-1"
            >
              View Report
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(`/tools/${task.tool.slug}`, '_blank')}
          >
            View Tool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
