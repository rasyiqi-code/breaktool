'use client';

import { useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useRealtimeUpdates();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
      case 'task_assigned':
        return '📋';
      case 'report_submitted':
        return '📄';
      case 'report_approved':
        return '✅';
      case 'report_rejected':
        return '❌';
      case 'user_notification':
        return '🔔';
      case 'system_update':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'report_approved':
        return 'text-green-600';
      case 'report_rejected':
        return 'text-red-600';
      case 'task_assigned':
        return 'text-blue-600';
      case 'system_update':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("relative", className)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearNotifications}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={cn(
                            "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                            !notification.read && "bg-blue-50/50 border-l-2 border-l-blue-500"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "text-sm font-medium",
                                  getNotificationColor(notification.type)
                                )}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
