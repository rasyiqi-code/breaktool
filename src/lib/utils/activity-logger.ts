// Activity Logger Utility
import { ActivityService } from '@/lib/services/activity.service';

export class ActivityLogger {
  // Log when a user registers
  static logUserRegistration(userName: string, userEmail: string) {
    ActivityService.addActivity({
      type: 'user_registered',
      title: 'New User Registered',
      description: `New user "${userName}" joined the platform`,
      status: 'approved',
      userName,
      metadata: { email: userEmail }
    });
  }

  // Log when a tool is submitted
  static logToolSubmission(toolName: string, userName: string, toolId?: string) {
    ActivityService.addActivity({
      type: 'tool_submitted',
      title: 'New Tool Submitted',
      description: `Tool "${toolName}" submitted for review`,
      status: 'pending',
      userName,
      toolName,
      toolId,
      metadata: { submissionTime: new Date().toISOString() }
    });
  }

  // Log when a tool is approved
  static logToolApproval(toolName: string, approvedBy: string, toolId?: string) {
    ActivityService.addActivity({
      type: 'tool_approved',
      title: 'Tool Approved',
      description: `Tool "${toolName}" approved and published`,
      status: 'approved',
      userName: approvedBy,
      toolName,
      toolId,
      metadata: { approvalTime: new Date().toISOString() }
    });
  }

  // Log when a review is created
  static logReviewCreation(toolName: string, userName: string, reviewId?: string) {
    ActivityService.addActivity({
      type: 'review_created',
      title: 'Review Created',
      description: `Comprehensive review for "${toolName}" published`,
      status: 'approved',
      userName,
      toolName,
      metadata: { reviewId: reviewId || '', creationTime: new Date().toISOString() }
    });
  }

  // Log when a user is verified as tester
  static logUserVerification(userName: string, verifiedBy: string) {
    ActivityService.addActivity({
      type: 'user_verified',
      title: 'Tester Verified',
      description: `New verified tester "${userName}" added to the platform`,
      status: 'approved',
      userName,
      metadata: { verifiedBy, verificationTime: new Date().toISOString() }
    });
  }

  // Log when a testing task is created
  static logTestingTaskCreation(toolName: string, createdBy: string, taskId?: string) {
    ActivityService.addActivity({
      type: 'testing_task_created',
      title: 'Testing Task Created',
      description: `New testing task assigned for "${toolName}" review`,
      status: 'pending',
      userName: createdBy,
      toolName,
      metadata: { taskId: taskId || '', creationTime: new Date().toISOString() }
    });
  }

  // Log when a testing report is submitted
  static logReportSubmission(toolName: string, userName: string, reportId?: string) {
    ActivityService.addActivity({
      type: 'report_submitted',
      title: 'Testing Report Submitted',
      description: `Detailed testing report for "${toolName}" submitted`,
      status: 'pending',
      userName,
      toolName,
      metadata: { reportId: reportId || '', submissionTime: new Date().toISOString() }
    });
  }

  // Log when a discussion is created
  static logDiscussionCreation(topic: string, userName: string, discussionId?: string) {
    ActivityService.addActivity({
      type: 'discussion_created',
      title: 'Discussion Started',
      description: `New discussion: "${topic}"`,
      status: 'approved',
      userName,
      metadata: { discussionId: discussionId || '', topic, creationTime: new Date().toISOString() }
    });
  }

  // Log custom activity
  static logCustomActivity(
    type: Parameters<typeof ActivityService.addActivity>[0]['type'],
    title: string,
    description: string,
    status: 'pending' | 'approved' | 'rejected' | 'completed' = 'approved',
    userName?: string,
    toolName?: string,
    metadata?: Record<string, string | number | boolean>
  ) {
    ActivityService.addActivity({
      type,
      title,
      description,
      status,
      userName,
      toolName,
      metadata
    });
  }
}

// Export individual functions for easier use
export const {
  logUserRegistration,
  logToolSubmission,
  logToolApproval,
  logReviewCreation,
  logUserVerification,
  logTestingTaskCreation,
  logReportSubmission,
  logDiscussionCreation,
  logCustomActivity
} = ActivityLogger;
