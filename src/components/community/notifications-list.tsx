"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types/app";
import { CommunityService } from "@/lib/services/community";
import { 
  Bell, 
  MessageSquare, 
  UserPlus, 
  ThumbsUp, 
  Star,
  Award,
  DollarSign,
  Clock,
  Check,
  Trash2,
} from "lucide-react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
// import { formatDistanceToNow } from "date-fns"; // Removed to fix build issues
import { LucideIcon } from "lucide-react";

interface NotificationsListProps {
  showFilters?: boolean;
  maxNotifications?: number;
}

export function NotificationsList({ 
  maxNotifications = 50 
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const user = useUser();

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const result = await CommunityService.getNotifications({
        unreadOnly: showUnreadOnly,
        limit: maxNotifications
      });
      setNotifications(result.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, showUnreadOnly, maxNotifications]);

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const count = await CommunityService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user?.id, showUnreadOnly, loadNotifications, loadUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await CommunityService.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await CommunityService.markAllNotificationsAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await CommunityService.deleteNotification(notificationId);
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count if it was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: LucideIcon } = {
      'discussion_reply': MessageSquare,
      'discussion_mention': MessageSquare,
      'follow': UserPlus,
      'review_like': ThumbsUp,
      'review_reply': MessageSquare,
      'tool_approved': Star,
      'tester_approved': Award,
      'subscription_expiring': Clock,
      'featured_placement_approved': Star,
      'affiliate_commission': DollarSign,
      'lead_generated': DollarSign
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'discussion_reply': 'blue',
      'discussion_mention': 'blue',
      'follow': 'green',
      'review_like': 'yellow',
      'review_reply': 'blue',
      'tool_approved': 'green',
      'tester_approved': 'purple',
      'subscription_expiring': 'orange',
      'featured_placement_approved': 'green',
      'affiliate_commission': 'green',
      'lead_generated': 'green'
    };
    return colorMap[type] || 'gray';
  };

  const getNotificationLink = (notification: Notification) => {
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'discussion_reply':
      case 'discussion_mention':
        return data.discussion_id ? `/discussions/${data.discussion_id}` : '/discussions';
      case 'follow':
        return data.follower_id ? `/profile/${data.follower_id}` : '/profile';
      case 'review_like':
      case 'review_reply':
        return data.tool_id ? `/tools/${data.tool_id}` : '/tools';
      case 'tool_approved':
        return data.tool_id ? `/tools/${data.tool_id}` : '/tools';
      case 'tester_approved':
        return '/apply-tester';
      case 'subscription_expiring':
        return '/subscription';
      case 'affiliate_commission':
        return '/tools';
      case 'lead_generated':
        return '/tools';
      default:
        return '#';
    }
  };

  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Sign in to view notifications
        </h3>
        <p className="text-sm text-muted-foreground">
          Create an account to receive notifications about your activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with your latest activity and community interactions
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Bell className="w-4 h-4 mr-2" />
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
            {unreadCount > 0 && !showUnreadOnly && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);
              const isUnread = !notification.read_at;
              const link = getNotificationLink(notification);

              return (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-md transition-shadow ${
                    isUnread ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                              {isUnread && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {link !== '#' && (
                          <div className="mt-3">
                            <Link href={link}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showUnreadOnly 
                ? 'You\'re all caught up! Check back later for new updates.'
                : 'Start interacting with the community to receive notifications.'
              }
            </p>
            {showUnreadOnly && (
              <Button variant="outline" onClick={() => setShowUnreadOnly(false)}>
                View All Notifications
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
