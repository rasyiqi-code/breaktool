import type { ToolSubmission } from '@/types/app'

export class SubmissionsService {
  // Submit new tool
  static async submitTool(submission: {
    name: string
    website: string
    description?: string
    category_id?: string
    logo_url?: string
    submitter_relationship?: string
    additional_info?: string
    submitted_by?: string
  }): Promise<ToolSubmission> {
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          status: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.submission as ToolSubmission;
    } catch (error) {
      console.error('Error submitting tool:', error);
      throw error;
    }
  }

  // Get submission by ID
  static async getSubmissionById(id: string): Promise<ToolSubmission | null> {
    try {
      const response = await fetch(`/api/tools/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as ToolSubmission;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  }

  // Get pending submissions (admin only)
  static async getPendingSubmissions(): Promise<ToolSubmission[]> {
    try {
      const response = await fetch('/api/admin/tools?status=pending');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      throw error;
    }
  }

  // Get user's submissions
  static async getUserSubmissions(userId: string): Promise<ToolSubmission[]> {
    try {
      const response = await fetch(`/api/users/${userId}/tools`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      throw error;
    }
  }

  // Approve submission and create tool (admin only)
  static async approveSubmission(
    submissionId: string, 
    reviewedBy: string,
    toolData?: {
      slug?: string
      long_description?: string
      pricing_model?: string
      starting_price?: number
      pricing_details?: Record<string, unknown>
    }
  ): Promise<void> {
    try {
      const response = await fetch(`/api/admin/tools/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy,
          ...toolData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
  }

  // Reject submission (admin only)
  static async rejectSubmission(
    submissionId: string, 
    reviewedBy: string, 
    reviewNotes?: string
  ): Promise<void> {
    try {
      const response = await fetch(`/api/admin/tools/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy,
          reviewNotes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      throw error;
    }
  }

  // Update submission (before approval)
  static async updateSubmission(id: string, updates: {
    name?: string
    website?: string
    description?: string
    category_id?: string
    logo_url?: string
    submitter_relationship?: string
    additional_info?: string
  }): Promise<ToolSubmission> {
    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ToolSubmission;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  // Delete submission
  static async deleteSubmission(id: string, userId?: string): Promise<void> {
    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }

  // Get submission statistics
  static async getSubmissionStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
  }> {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        total: data.total_submissions || 0,
        pending: data.pending_submissions || 0,
        approved: data.approved_submissions || 0,
        rejected: data.rejected_submissions || 0
      };
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      throw error;
    }
  }
}