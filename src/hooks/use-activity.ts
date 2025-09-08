"use client";

import { useState, useEffect, useCallback } from 'react';
import { ActivityService, ActivityItem } from '@/lib/services/activity.service';

export function useActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load activities from localStorage
  const loadActivities = useCallback(() => {
    try {
      setLoading(true);
      const data = ActivityService.getRecentActivities(20);
      setActivities(data);
      setError(null);
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new activity
  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    try {
      ActivityService.addActivity(activity);
      loadActivities(); // Refresh the list
    } catch (err) {
      setError('Failed to add activity');
      console.error('Error adding activity:', err);
    }
  }, [loadActivities]);

  // Update activity status
  const updateActivityStatus = useCallback((activityId: string, status: ActivityItem['status']) => {
    try {
      ActivityService.updateActivityStatus(activityId, status);
      loadActivities(); // Refresh the list
    } catch (err) {
      setError('Failed to update activity status');
      console.error('Error updating activity status:', err);
    }
  }, [loadActivities]);

  // Get activity statistics
  const getStats = useCallback(() => {
    return ActivityService.getActivityStats();
  }, []);

  // Check if activities exist
  const hasActivities = useCallback(() => {
    return ActivityService.hasActivities();
  }, []);

  // Clear all activities
  const clearAllActivities = useCallback(() => {
    try {
      ActivityService.clearAllActivities();
      setActivities([]);
    } catch (err) {
      setError('Failed to clear activities');
      console.error('Error clearing activities:', err);
    }
  }, []);

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    addActivity,
    updateActivityStatus,
    getStats,
    hasActivities,
    clearAllActivities,
    refresh: loadActivities
  };
}
