// Activity Integration Utilities
// This file provides easy integration points for logging activities across the app

import { ActivityLogger } from './activity-logger';

export class ActivityIntegration {
  // Log user registration from sign-up page
  static logUserSignUp(userName: string, userEmail: string) {
    ActivityLogger.logUserRegistration(userName, userEmail);
  }

  // Log tool submission from tool submission page
  static logToolSubmissionFromPage(toolName: string, userName: string, toolId?: string) {
    ActivityLogger.logToolSubmission(toolName, userName, toolId);
  }

  // Log review creation from review page
  static logReviewCreationFromPage(toolName: string, userName: string, reviewId?: string) {
    ActivityLogger.logReviewCreation(toolName, userName, reviewId);
  }

  // Log discussion creation from discussion page
  static logDiscussionCreationFromPage(topic: string, userName: string, discussionId?: string) {
    ActivityLogger.logDiscussionCreation(topic, userName, discussionId);
  }

  // Log testing report submission from tester dashboard
  static logReportSubmissionFromPage(toolName: string, userName: string, reportId?: string) {
    ActivityLogger.logReportSubmission(toolName, userName, reportId);
  }

  // Log admin actions
  static logAdminAction(action: string, details: string, adminName: string = 'Admin') {
    ActivityLogger.logCustomActivity(
      'tool_approved', // Using tool_approved as generic admin action type
      `Admin Action: ${action}`,
      details,
      'approved',
      adminName
    );
  }

  // Log system events
  static logSystemEvent(event: string, details: string) {
    ActivityLogger.logCustomActivity(
      'user_registered', // Using user_registered as generic system event type
      `System Event: ${event}`,
      details,
      'approved',
      'System'
    );
  }
}

// Export individual functions for easier use
export const {
  logUserSignUp,
  logToolSubmissionFromPage,
  logReviewCreationFromPage,
  logDiscussionCreationFromPage,
  logReportSubmissionFromPage,
  logAdminAction,
  logSystemEvent
} = ActivityIntegration;
