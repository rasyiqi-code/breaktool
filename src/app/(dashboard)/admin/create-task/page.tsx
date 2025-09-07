'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestingTaskForm } from '@/components/testing/testing-task-form';
import { useRoleCheck } from '@/hooks/use-role-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  category?: {
    name: string;
  };
}

interface Tester {
  id: string;
  name: string;
  email: string;
  role: string;
  trustScore: number;
  isVerifiedTester: boolean;
}

interface TestingTaskFormData {
  toolId: string;
  testerId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  reward: number;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const { hasAccess, isLoading: roleLoading } = useRoleCheck({
    requiredRoles: ['admin', 'super_admin']
  });

  const [tools, setTools] = useState<Tool[]>([]);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [hasAccess]);

  const fetchData = async () => {
    try {
      const [toolsRes, testersRes] = await Promise.all([
        fetch('/api/admin/tools'),
        fetch('/api/admin/testers')
      ]);

      const [toolsData, testersData] = await Promise.all([
        toolsRes.json(),
        testersRes.json()
      ]);

      setTools(Array.isArray(toolsData) ? toolsData : []);
      setTesters(testersData.testers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: TestingTaskFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/testing/tester-stats/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to create testing tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create Testing Task</h1>
          </div>
          <p className="text-muted-foreground">
            Assign a new testing task to a verified tester
          </p>
        </div>

        {/* Form */}
        <TestingTaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          tools={tools}
          testers={testers}
          isLoading={isSubmitting}
        />

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Task Guidelines</CardTitle>
            <CardDescription>
              Best practices for creating effective testing tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Clear Objectives:</strong> Provide specific goals and what needs to be tested</p>
            <p>• <strong>Realistic Deadlines:</strong> Allow sufficient time for thorough testing</p>
            <p>• <strong>Appropriate Rewards:</strong> Set fair compensation based on task complexity</p>
            <p>• <strong>Detailed Description:</strong> Include context, requirements, and expected outcomes</p>
            <p>• <strong>Right Tester:</strong> Match tester expertise with tool category when possible</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
