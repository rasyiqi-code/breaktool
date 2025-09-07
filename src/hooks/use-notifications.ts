// Notifications Hook
"use client"

import { useState, useEffect } from 'react'
import { Notification } from '@/types/app'
import { CommunityService } from '@/lib/services/community/community.service'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await CommunityService.getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount((data.notifications || []).filter(n => !n.read_at).length)
    } catch (err) {
      setError('Failed to fetch notifications')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await CommunityService.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await CommunityService.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString()
        }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await CommunityService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  }
}
