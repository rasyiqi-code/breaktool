'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@stackframe/stack';

interface WebSocketEvent {
  type: 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 
        'report_submitted' | 'report_approved' | 'report_rejected' | 
        'user_notification' | 'system_update';
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  role?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

export function useRealtimeUpdates() {
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addNotification = useCallback((event: WebSocketEvent) => {
    const notification: Notification = {
      id: `${event.type}-${Date.now()}`,
      type: event.type,
      title: getNotificationTitle(event.type),
      message: getNotificationMessage(event.type, event.data),
      timestamp: event.timestamp,
      read: false,
      data: event.data
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!user) return;

    // For demo purposes, we'll simulate WebSocket connection
    // In production, you'd connect to a real WebSocket server
    const simulateConnection = () => {
      setIsConnected(true);
      
      // Simulate receiving events
      const eventTypes = [
        'task_created',
        'task_assigned', 
        'report_submitted',
        'report_approved',
        'report_rejected'
      ];

      const interval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance every 5 seconds
          const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const event: WebSocketEvent = {
            type: randomType as WebSocketEvent['type'],
            data: {
              id: `demo-${Date.now()}`,
              title: `Demo ${randomType.replace('_', ' ')}`,
              description: 'This is a demo notification'
            },
            timestamp: new Date().toISOString(),
            userId: user.id
          };
          addNotification(event);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = simulateConnection();
    return cleanup;
  }, [user, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'task_created':
      return 'New Testing Task';
    case 'task_assigned':
      return 'Task Assigned';
    case 'task_started':
      return 'Task Started';
    case 'task_completed':
      return 'Task Completed';
    case 'report_submitted':
      return 'Report Submitted';
    case 'report_approved':
      return 'Report Approved';
    case 'report_rejected':
      return 'Report Rejected';
    case 'user_notification':
      return 'Notification';
    case 'system_update':
      return 'System Update';
    default:
      return 'Update';
  }
}

function getNotificationMessage(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case 'task_created':
      return `A new testing task "${data.title}" has been created.`;
    case 'task_assigned':
      return `You have been assigned a new testing task: "${data.title}".`;
    case 'task_started':
      return `Testing task "${data.title}" has been started.`;
    case 'task_completed':
      return `Testing task "${data.title}" has been completed.`;
    case 'report_submitted':
      return `A new testing report for "${data.toolName}" has been submitted.`;
    case 'report_approved':
      return `Your testing report for "${data.toolName}" has been approved.`;
    case 'report_rejected':
      return `Your testing report for "${data.toolName}" has been rejected.`;
    case 'user_notification':
      return (data.message as string) || 'You have a new notification.';
    case 'system_update':
      return (data.message as string) || 'System has been updated.';
    default:
      return 'You have a new update.';
  }
}
