// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

// Function to broadcast notifications to all connected clients
export function broadcastNotification(notification: {
  type: string;
  issueId?: string;
  message: string;
  data?: any;
}) {
  const message = JSON.stringify({
    ...notification,
    timestamp: new Date().toISOString(),
  });

  connections.forEach((controller, connectionId) => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      // Remove dead connections
      connections.delete(connectionId);
    }
  });
}

// Function to broadcast to specific issue viewers
export function broadcastToIssue(
  issueId: string,
  notification: {
    type: string;
    message: string;
    data?: any;
  }
) {
  broadcastNotification({
    ...notification,
    issueId,
  });
}

// Function to add a connection
export function addConnection(
  connectionId: string,
  controller: ReadableStreamDefaultController
) {
  connections.set(connectionId, controller);
}

// Function to remove a connection
export function removeConnection(connectionId: string) {
  connections.delete(connectionId);
}

// Function to get connection count
export function getConnectionCount(): number {
  return connections.size;
}
