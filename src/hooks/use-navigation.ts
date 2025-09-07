"use client"

import { useState, useEffect } from "react"
import { useUser, useStackApp } from "@stackframe/stack"

interface Notification {
  id: string;
  read_at?: string;
}

export function useNavigation() {
  const [isClient, setIsClient] = useState(false)
  const [userRole, setUserRole] = useState<string>('user')
  const [userData, setUserData] = useState<{
    id?: string;
    displayName?: string;
    primaryEmail?: string;
    profileImageUrl?: string;
    [key: string]: unknown;
  } | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const user = useUser()
  const stackApp = useStackApp()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch user role and data from Prisma database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users/get-user-profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || 'user');
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/community/notifications');
        if (response.ok) {
          const notifications = await response.json();
          const unread = notifications.filter((n: Notification) => !n.read_at).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Auto-sync user to Prisma database when they first load the app
  useEffect(() => {
    if (!isClient || !user?.id) return;

    // Only sync if user exists but we haven't synced yet
    const hasSynced = sessionStorage.getItem(`synced-${user.id}`);
    if (hasSynced) return;

    const syncUser = async () => {
      try {
        // Check if user exists in database first
        const response = await fetch(`/api/users/check-user-exists?userId=${user.id}`);
        
        if (!response.ok) {
          console.error('❌ Failed to check user existence:', response.status);
          return;
        }
        
        const { exists } = await response.json();
        
        if (!exists) {
          console.log('🔄 User not found in database, auto-syncing...');
          // Auto-sync user to Prisma database
          const syncResponse = await fetch('/api/users/auto-sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.primaryEmail,
              name: user.displayName,
              avatar_url: user.profileImageUrl
            })
          });
          
          if (syncResponse.ok) {
            console.log('✅ User auto-synced to database');
          } else {
            console.error('❌ Auto-sync failed:', syncResponse.status);
          }
        }
      } catch (error) {
        console.error('❌ Auto-sync failed on navigation:', error);
      }
    };

    syncUser();
    sessionStorage.setItem(`synced-${user.id}`, 'true');
  }, [isClient, user?.id, user?.displayName, user?.primaryEmail, user?.profileImageUrl]);

  return {
    isClient,
    user,
    stackApp,
    userRole,
    userData,
    unreadCount
  }
}
