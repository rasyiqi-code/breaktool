'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceAnalytics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    trend: 'up' | 'down' | 'stable';
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    peakLoad: number;
    trend: 'up' | 'down' | 'stable';
  };
  errorRate: {
    current: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  systemResources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    databaseQueryTime: number;
    cacheHitRate: number;
  };
  bottlenecks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
  }>;
}

export function PerformanceAnalytics() {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics>({
    responseTime: { average: 0, p95: 0, p99: 0, trend: 'stable' },
    throughput: { requestsPerSecond: 0, requestsPerMinute: 0, peakLoad: 0, trend: 'stable' },
    errorRate: { current: 0, average: 0, trend: 'stable' },
    systemResources: { cpu: 0, memory: 0, disk: 0, network: 0 },
    performanceMetrics: { pageLoadTime: 0, apiResponseTime: 0, databaseQueryTime: 0, cacheHitRate: 0 },
    bottlenecks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceAnalytics();
  }, []);

  const fetchPerformanceAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/performance');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            <p className="text-muted-foreground">Monitor system performance and identify bottlenecks</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-muted-foreground">Monitor system performance and identify bottlenecks</p>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseTime.average}ms</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.responseTime.trend)}
              <span className={`text-xs ${getTrendColor(analytics.responseTime.trend)}`}>
                P95: {analytics.responseTime.p95}ms
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.throughput.requestsPerSecond}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.throughput.trend)}
              <span className="text-xs text-muted-foreground">
                {analytics.throughput.requestsPerMinute} req/min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.errorRate.current.toFixed(2)}%</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.errorRate.trend)}
              <span className={`text-xs ${getTrendColor(analytics.errorRate.trend)}`}>
                Avg: {analytics.errorRate.average.toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.systemResources.cpu < 80 && analytics.systemResources.memory < 80 ? 'Healthy' : 'Warning'}
            </div>
            <p className="text-xs text-muted-foreground">
              CPU: {analytics.systemResources.cpu}% | Memory: {analytics.systemResources.memory}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Current system resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">{analytics.systemResources.cpu}%</span>
              </div>
              <Progress value={analytics.systemResources.cpu} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <span className="text-sm font-medium">{analytics.systemResources.memory}%</span>
              </div>
              <Progress value={analytics.systemResources.memory} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <span className="text-sm font-medium">{analytics.systemResources.disk}%</span>
              </div>
              <Progress value={analytics.systemResources.disk} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <span className="text-sm font-medium">{analytics.systemResources.network}%</span>
              </div>
              <Progress value={analytics.systemResources.network} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Detailed performance measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Page Load Time</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.pageLoadTime}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API Response Time</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.apiResponseTime}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database Query Time</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.databaseQueryTime}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Cache Hit Rate</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.cacheHitRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Bottlenecks */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Bottlenecks</CardTitle>
            <CardDescription>Identified performance issues and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.bottlenecks.length > 0 ? (
                analytics.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{bottleneck.type}</span>
                      <Badge className={getSeverityColor(bottleneck.severity)}>
                        {bottleneck.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{bottleneck.description}</p>
                    <p className="text-xs text-muted-foreground">{bottleneck.impact}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No performance bottlenecks detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>Optimization suggestions based on current performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {analytics.responseTime.average > 500 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">High Response Time</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Consider implementing caching, database optimization, or CDN to improve response times.
                </p>
              </div>
            )}
            
            {analytics.errorRate.current > 1 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">High Error Rate</span>
                </div>
                <p className="text-sm text-red-700">
                  Investigate error logs and implement better error handling and monitoring.
                </p>
              </div>
            )}
            
            {analytics.systemResources.cpu > 80 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">High CPU Usage</span>
                </div>
                <p className="text-sm text-orange-700">
                  Consider scaling resources or optimizing CPU-intensive operations.
                </p>
              </div>
            )}
            
            {analytics.performanceMetrics.cacheHitRate < 70 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Low Cache Hit Rate</span>
                </div>
                <p className="text-sm text-blue-700">
                  Optimize caching strategy and increase cache duration for better performance.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
