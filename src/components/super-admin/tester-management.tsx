'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Users, 
  CheckCircle, 
  XCircle, 
  Award,
  Target,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';

interface Tester {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  trustScore: number;
  joinDate: string;
  lastActive: string;
  status: string;
  averageRating: number;
  totalReviews: number;
  totalTests: number;
  testsCompleted: number; // Add this property
  totalEarnings: string; // Add this property
  specializations: string[]; // Add this property
  expertiseAreas: string[];
  experienceYears: number;
  company: string | null;
  jobTitle: string | null;
  badges: string[];
  location: string | null;
  verifiedAt: string | null;
  recentReviews: Array<{
    id: string;
    toolName: string;
    score: number;
    date: string;
  }>;
  recentTests: Array<{
    id: string;
    toolName: string;
    status: string;
    date: string;
  }>;
}

interface TesterStats {
  totalTesters: number;
  activeTesters: number;
  pendingTesters: number;
  suspendedTesters: number;
}

export default function TesterManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [testers, setTesters] = useState<Tester[]>([]);
  const [stats, setStats] = useState<TesterStats>({
    totalTesters: 0,
    activeTesters: 0,
    pendingTesters: 0,
    suspendedTesters: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTesters = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/testers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch testers');
      }
      
      const data = await response.json();
      setTesters(data.testers);
      setStats(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchTesters();
  }, [fetchTesters]);

  // const handleTesterAction = async (testerId: string, action: 'approved' | 'suspended', reason?: string) => {
  //   try {
  //     const response = await fetch('/api/admin/testers', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         testerId,
  //         action,
  //         reason
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update tester');
  //     }

  //     // Refresh the data
  //     await fetchTesters();
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'An error occurred');
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading testers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchTesters} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Real implementation - data fetched from API

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: 'default',
      pending: 'secondary',
      suspended: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const verifiedTesters = testers.filter(t => t.status === 'verified');
  const pendingTesters = testers.filter(t => t.status === 'pending');
  const suspendedTesters = testers.filter(t => t.status === 'suspended');

  const totalTestsCompleted = testers.reduce((sum, tester) => sum + tester.testsCompleted, 0);
  const averageTrustScore = testers.reduce((sum, tester) => sum + tester.trustScore, 0) / testers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tester Management</h2>
          <p className="text-muted-foreground">
            Manage verified testers and their performance
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Tester
        </Button>
      </div>

      {/* Tester Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Testers</p>
                <p className="text-2xl font-bold">{stats.totalTesters.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Testers</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeTesters.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Completed</p>
                <p className="text-2xl font-bold">{totalTestsCompleted}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Trust Score</p>
                <p className="text-2xl font-bold text-green-600">{averageTrustScore.toFixed(1)}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testers List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({testers.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedTesters.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingTesters.length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({suspendedTesters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {testers.map((tester) => (
            <Card key={tester.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {tester.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tester.name}</CardTitle>
                      <CardDescription>{tester.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(tester.status)}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tests Completed</p>
                    <p className="text-lg font-bold">{tester.testsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold">{tester.averageRating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trust Score</p>
                    <p className={`text-lg font-bold ${getTrustScoreColor(tester.trustScore)}`}>
                      {tester.trustScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-lg font-bold text-green-600">{tester.totalEarnings}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Specializations</p>
                  <div className="flex gap-1 flex-wrap">
                        {tester.specializations.map((spec: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <p>Joined: {tester.joinDate}</p>
                    <p>Last active: {tester.lastActive}</p>
                  </div>
                  <div className="flex gap-2">
                    {tester.status === 'pending' && (
                      <>
                        <Button variant="destructive" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                      </>
                    )}
                    {tester.status === 'suspended' && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                    )}
                    {tester.status === 'verified' && (
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verifiedTesters.map((tester) => (
            <Card key={tester.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {tester.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tester.name}</CardTitle>
                      <CardDescription>{tester.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(tester.status)}
                    <Badge variant="outline">
                      {tester.testsCompleted} tests
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold">{tester.averageRating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trust Score</p>
                    <p className={`text-lg font-bold ${getTrustScoreColor(tester.trustScore)}`}>
                      {tester.trustScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-lg font-bold text-green-600">{tester.totalEarnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingTesters.map((tester) => (
            <Card key={tester.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-yellow-600">
                        {tester.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tester.name}</CardTitle>
                      <CardDescription>{tester.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(tester.status)}
                    <Badge variant="outline">
                      Awaiting verification
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Applied: {tester.joinDate}</p>
                    <p>Specializations: {tester.specializations.join(', ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          {suspendedTesters.map((tester) => (
            <Card key={tester.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-red-600">
                        {tester.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tester.name}</CardTitle>
                      <CardDescription>{tester.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(tester.status)}
                    <Badge variant="outline">
                      Suspended
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Suspended: {tester.lastActive}</p>
                    <p>Previous trust score: {tester.trustScore}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reactivate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
