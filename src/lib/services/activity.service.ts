// Activity Service for localStorage-based activity tracking
export interface ActivityItem {
  id: string;
  type: 'tool_submitted' | 'review_created' | 'user_verified' | 'tool_approved' | 'user_registered' | 'testing_task_created' | 'report_submitted' | 'discussion_created';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  userId?: string;
  userName?: string;
  toolId?: string;
  toolName?: string;
  metadata?: Record<string, string | number | boolean>;
}

export class ActivityService {
  private static readonly STORAGE_KEY = 'breaktool_activities';
  private static readonly MAX_ACTIVITIES = 100;

  // Get all activities from localStorage
  static getActivities(): ActivityItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const activities = JSON.parse(stored);
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      console.error('Error loading activities from localStorage:', error);
      return [];
    }
  }

  // Save activities to localStorage
  private static saveActivities(activities: ActivityItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only the most recent activities
      const limitedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.MAX_ACTIVITIES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedActivities));
    } catch (error) {
      console.error('Error saving activities to localStorage:', error);
    }
  }

  // Add a new activity
  static addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const activities = this.getActivities();
    activities.unshift(newActivity); // Add to beginning
    this.saveActivities(activities);
  }

  // Update activity status
  static updateActivityStatus(activityId: string, status: ActivityItem['status']): void {
    const activities = this.getActivities();
    const activityIndex = activities.findIndex(a => a.id === activityId);
    
    if (activityIndex !== -1) {
      activities[activityIndex].status = status;
      this.saveActivities(activities);
    }
  }

  // Get recent activities (last N activities)
  static getRecentActivities(limit: number = 10): ActivityItem[] {
    const activities = this.getActivities();
    return activities.slice(0, limit);
  }

  // Clear all activities
  static clearAllActivities(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if activities exist, if not show empty state
  static hasActivities(): boolean {
    const activities = this.getActivities();
    return activities.length > 0;
  }

  // Get activity statistics
  static getActivityStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: Record<string, number>;
  } {
    const activities = this.getActivities();
    
    const stats = {
      total: activities.length,
      pending: activities.filter(a => a.status === 'pending').length,
      approved: activities.filter(a => a.status === 'approved').length,
      rejected: activities.filter(a => a.status === 'rejected').length,
      byType: {} as Record<string, number>
    };

    // Count by type
    activities.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
    });

    return stats;
  }
}
