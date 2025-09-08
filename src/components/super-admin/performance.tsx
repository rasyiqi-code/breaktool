'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Activity,
  Database,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
  responseTime: {
    current: number;
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  errorRate: {
    current: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    size: string;
  };
  database: {
    connectionPool: number;
    queryTime: number;
    slowQueries: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function Performance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: {
      current: 120,
      average: 135,
      p95: 250,
      p99: 500
    },
    throughput: {
      requestsPerSecond: 45,
      requestsPerMinute: 2700,
      requestsPerHour: 162000
    },
    errorRate: {
      current: 0.2,
      average: 0.5,
      trend: 'down'
    },
    resourceUsage: {
      cpu: 45,
      memory: 68,
      disk: 78,
      network: 23
    },
    cache: {
      hitRate: 85,
      missRate: 15,
      size: '2.1 GB'
    },
    database: {
      connectionPool: 60,
      queryTime: 45,
      slowQueries: 3
    }
  });

  const [alerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'High memory usage detected (85%)',
      timestamp: '2024-01-15 14:30:00',
      resolved: false
    },
    {
      id: '2',
      type: 'error',
      message: 'Database query timeout exceeded',
      timestamp: '2024-01-15 14:25:00',
      resolved: true
    },
    {
      id: '3',
      type: 'info',
      message: 'Cache hit rate improved to 85%',
      timestamp: '2024-01-15 14:20:00',
      resolved: true
    }
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate some metric changes
      setMetrics(prev => ({
        ...prev,
        responseTime: {
          ...prev.responseTime,
          current: Math.max(50, Math.min(500, prev.responseTime.current + (Math.random() - 0.5) * 20))
        },
        throughput: {
          ...prev.throughput,
          requestsPerSecond: Math.max(10, Math.min(100, prev.throughput.requestsPerSecond + (Math.random() - 0.5) * 10))
        },
        errorRate: {
          ...prev.errorRate,
          current: Math.max(0, Math.min(5, prev.errorRate.current + (Math.random() - 0.5) * 0.5))
        }
      }));
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Performance Monitoring
          </h2>
          <p className="text-muted-foreground">
            Monitor system performance, optimize bottlenecks, and track improvements
          </p>
        </div>
        <Button onClick={refreshMetrics} disabled={refreshing}>
          {refreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(metrics.responseTime.current, { good: 200, warning: 500, critical: 1000 })}`}>
              {metrics.responseTime.current}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics.responseTime.average}ms
            </p>
            <Progress value={(1000 - metrics.responseTime.current) / 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.throughput.requestsPerSecond}/s
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.throughput.requestsPerMinute.toLocaleString()}/min
            </p>
            <Progress value={metrics.throughput.requestsPerSecond} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(metrics.errorRate.current, { good: 1, warning: 3, critical: 5 })}`}>
              {metrics.errorRate.current}%
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics.errorRate.average}%
            </p>
            <Progress value={metrics.errorRate.current * 20} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.cache.hitRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Size: {metrics.cache.size}
            </p>
            <Progress value={metrics.cache.hitRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Response Time Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analysis</CardTitle>
            <CardDescription>
              Detailed response time metrics and percentiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current</span>
                <span className={`font-medium ${getPerformanceColor(metrics.responseTime.current, { good: 200, warning: 500, critical: 1000 })}`}>
                  {metrics.responseTime.current}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average</span>
                <span className="font-medium">{metrics.responseTime.average}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">95th Percentile</span>
                <span className="font-medium">{metrics.responseTime.p95}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">99th Percentile</span>
                <span className="font-medium">{metrics.responseTime.p99}ms</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Performance Targets</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Target Response Time</span>
                  <span className="text-green-600">≤ 200ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Acceptable Response Time</span>
                  <span className="text-yellow-600">≤ 500ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Critical Response Time</span>
                  <span className="text-red-600">&gt; 1000ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Current system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <span className="font-medium">{metrics.resourceUsage.cpu}%</span>
              </div>
              <Progress value={metrics.resourceUsage.cpu} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <span className="font-medium">{metrics.resourceUsage.memory}%</span>
              </div>
              <Progress value={metrics.resourceUsage.memory} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm">Disk Usage</span>
                </div>
                <span className="font-medium">{metrics.resourceUsage.disk}%</span>
              </div>
              <Progress value={metrics.resourceUsage.disk} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Network I/O</span>
                </div>
                <span className="font-medium">{metrics.resourceUsage.network}%</span>
              </div>
              <Progress value={metrics.resourceUsage.network} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Database Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
            <CardDescription>
              Database connection and query performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Connection Pool Usage</span>
                <span className="font-medium">{metrics.database.connectionPool}%</span>
              </div>
              <Progress value={metrics.database.connectionPool} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Query Time</span>
                <span className="font-medium">{metrics.database.queryTime}ms</span>
              </div>
              <Progress value={metrics.database.queryTime / 5} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Slow Queries</span>
                <span className="font-medium">{metrics.database.slowQueries}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Alerts</CardTitle>
            <CardDescription>
              Recent performance-related alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAlertBadge(alert.type)}
                      {alert.resolved && (
                        <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization</CardTitle>
          <CardDescription>
            Recommendations for improving system performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Cache Optimization</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Current hit rate is good at 85%. Consider implementing Redis for better performance.
              </p>
              <Button size="sm" variant="outline">Optimize Cache</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Database Tuning</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Query performance is good. Consider adding indexes for frequently accessed data.
              </p>
              <Button size="sm" variant="outline">Review Queries</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">CDN Implementation</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Consider implementing a CDN to reduce response times for static assets.
              </p>
              <Button size="sm" variant="outline">Setup CDN</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
