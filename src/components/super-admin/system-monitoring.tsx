'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Monitor
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  loadAverage: number[];
  activeConnections: number;
  responseTime: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
}

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    disk: 78,
    network: 23,
    uptime: '15 days, 4 hours',
    loadAverage: [1.2, 1.5, 1.8],
    activeConnections: 156,
    responseTime: 120
  });

  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:15',
      level: 'info',
      message: 'User authentication successful',
      source: 'auth-service'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:29:45',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system-monitor'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:28:30',
      level: 'error',
      message: 'Database connection timeout',
      source: 'database'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:27:12',
      level: 'info',
      message: 'API request processed successfully',
      source: 'api-gateway'
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:26:55',
      level: 'debug',
      message: 'Cache hit for user profile',
      source: 'cache-service'
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
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 20))
      }));
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'debug':
        return <Badge variant="outline">Debug</Badge>;
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
            <Monitor className="h-6 w-6" />
            System Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
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

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
              {metrics.cpu.toFixed(1)}%
            </div>
            <Progress value={metrics.cpu} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Load: {metrics.loadAverage.map(l => l.toFixed(2)).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
              {metrics.memory.toFixed(1)}%
            </div>
            <Progress value={metrics.memory} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {(100 - metrics.memory).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.disk, { warning: 85, critical: 95 })}`}>
              {metrics.disk.toFixed(1)}%
            </div>
            <Progress value={metrics.disk} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Free: {(100 - metrics.disk).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.network, { warning: 80, critical: 95 })}`}>
              {metrics.network.toFixed(1)}%
            </div>
            <Progress value={metrics.network} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.activeConnections} connections
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Overall system health and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Uptime</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {metrics.uptime}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metrics.responseTime}ms</span>
                  {metrics.responseTime < 200 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Connections</span>
                <span className="text-sm font-medium">{metrics.activeConnections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Load Average (1m, 5m, 15m)</span>
                <span className="text-sm font-medium">
                  {metrics.loadAverage.map(l => l.toFixed(2)).join(', ')}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Service Status</h4>
              <div className="space-y-2">
                {[
                  { name: 'Web Server', status: 'healthy', uptime: '99.9%' },
                  { name: 'Database', status: 'healthy', uptime: '99.8%' },
                  { name: 'Cache Service', status: 'healthy', uptime: '99.9%' },
                  { name: 'API Gateway', status: 'warning', uptime: '98.5%' },
                  { name: 'Email Service', status: 'healthy', uptime: '99.7%' }
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' : 
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">{service.name}</span>
                    </div>
                    <Badge variant={service.status === 'healthy' ? 'default' : 'secondary'}>
                      {service.uptime}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>
              Latest system events and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getLogLevelIcon(log.level)}
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    {getLogLevelBadge(log.level)}
                  </div>
                  <p className="text-sm mb-1">{log.message}</p>
                  <p className="text-xs text-muted-foreground">Source: {log.source}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Historical performance data and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">CPU Trend</h4>
              <p className="text-sm text-muted-foreground">Stable</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Memory Trend</h4>
              <p className="text-sm text-muted-foreground">Stable</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <h4 className="font-medium">Response Time</h4>
              <p className="text-sm text-muted-foreground">Increasing</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Throughput</h4>
              <p className="text-sm text-muted-foreground">Stable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
