// Simple in-memory store for WebSocket connections
// In production, you'd want to use Redis or a proper WebSocket service

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocket> = new Map();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  addConnection(userId: string, connection: WebSocket) {
    this.connections.set(userId, connection);
  }

  removeConnection(userId: string) {
    this.connections.delete(userId);
  }

  sendToUser(userId: string, message: Record<string, unknown>) {
    const connection = this.connections.get(userId);
    if (connection) {
      try {
        connection.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message to user:', error);
        this.removeConnection(userId);
      }
    }
  }

  broadcastToRole(role: string, message: Record<string, unknown>) {
    // In a real implementation, you'd filter by role
    // For now, we'll broadcast to all connections
    this.connections.forEach((connection, userId) => {
      this.sendToUser(userId, message);
    });
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}

// Event types for real-time updates
export interface WebSocketEvent {
  type: 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 
        'report_submitted' | 'report_approved' | 'report_rejected' | 
        'user_notification' | 'system_update';
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  role?: string;
  [key: string]: unknown;
}

// Helper functions to send specific events
export const sendTaskCreated = (taskData: Record<string, unknown>, adminId: string) => {
  const event: WebSocketEvent = {
    type: 'task_created',
    data: taskData,
    timestamp: new Date().toISOString(),
    userId: adminId
  };
  
  const manager = WebSocketManager.getInstance();
  manager.broadcastToRole('verified_tester', event);
};

export const sendTaskAssigned = (taskData: Record<string, unknown>, testerId: string) => {
  const event: WebSocketEvent = {
    type: 'task_assigned',
    data: taskData,
    timestamp: new Date().toISOString(),
    userId: testerId
  };
  
  const manager = WebSocketManager.getInstance();
  manager.sendToUser(testerId, event);
};

export const sendReportSubmitted = (reportData: Record<string, unknown>, adminId: string) => {
  const event: WebSocketEvent = {
    type: 'report_submitted',
    data: reportData,
    timestamp: new Date().toISOString(),
    userId: adminId
  };
  
  const manager = WebSocketManager.getInstance();
  manager.broadcastToRole('admin', event);
};

export const sendReportApproved = (reportData: Record<string, unknown>, testerId: string) => {
  const event: WebSocketEvent = {
    type: 'report_approved',
    data: reportData,
    timestamp: new Date().toISOString(),
    userId: testerId
  };
  
  const manager = WebSocketManager.getInstance();
  manager.sendToUser(testerId, event);
};

export const sendReportRejected = (reportData: Record<string, unknown>, testerId: string) => {
  const event: WebSocketEvent = {
    type: 'report_rejected',
    data: reportData,
    timestamp: new Date().toISOString(),
    userId: testerId
  };
  
  const manager = WebSocketManager.getInstance();
  manager.sendToUser(testerId, event);
};
