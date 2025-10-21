"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface NotificationData {
  type: string;
  issueId?: string;
  message: string;
  data?: any;
  timestamp: string;
}

interface UseRealTimeNotificationsOptions {
  issueId?: string; // If provided, only listen for notifications for this issue
  onNotification?: (notification: NotificationData) => void;
}

export function useRealTimeNotifications(
  options: UseRealTimeNotificationsOptions = {}
) {
  const { user } = useAuth();
  const { showInfo } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Store options in ref to avoid recreating connect function
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (!user || eventSourceRef.current) return;

    try {
      const eventSource = new EventSource("/api/notifications");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        if (process.env.NODE_ENV === "development") {
          console.log("🔗 Real-time notifications connected");
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: NotificationData = JSON.parse(event.data);

          // Skip heartbeat messages
          if (notification.type === "heartbeat") return;

          // If we're listening for a specific issue, filter notifications
          if (
            optionsRef.current.issueId &&
            notification.issueId &&
            notification.issueId !== optionsRef.current.issueId
          ) {
            return;
          }

          // Call custom handler if provided
          if (optionsRef.current.onNotification) {
            optionsRef.current.onNotification(notification);
          }

          // Show toast notification for relevant events
          if (
            notification.type === "comment_added" &&
            notification.issueId === optionsRef.current.issueId
          ) {
            showInfo("💬 New Comment", notification.message);
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error parsing notification:", error);
          }
        }
      };

      eventSource.onerror = (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("EventSource error:", error);
        }
        setIsConnected(false);
        setConnectionError("Connection lost");

        // Close the current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectAttempts.current++;

          if (process.env.NODE_ENV === "development") {
            console.log(
              `🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`
            );
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create EventSource:", error);
      }
      setConnectionError("Failed to establish connection");
    }
  }, [user, showInfo]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Health check failed:", error);
      }
      return false;
    }
  }, []);

  // Connect when user is authenticated
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Health check every 60 seconds
  useEffect(() => {
    if (!isConnected) return;

    const healthCheckInterval = setInterval(async () => {
      const isHealthy = await checkHealth();
      if (!isHealthy && isConnected) {
        if (process.env.NODE_ENV === "development") {
          console.log("🏥 Health check failed, attempting to reconnect...");
        }
        disconnect();
        setTimeout(connect, 1000);
      }
    }, 60000);

    return () => clearInterval(healthCheckInterval);
  }, [isConnected, checkHealth, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    checkHealth,
  };
}
