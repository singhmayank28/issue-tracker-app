import { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { addConnection, removeConnection } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  // Verify authentication
  const user = getCurrentUserFromRequest(request);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const connectionId = `${user.userId}-${Date.now()}`;

  const stream = new ReadableStream({
    start(controller) {
      // Store the connection
      addConnection(connectionId, controller);

      // Send initial connection message
      const data = JSON.stringify({
        type: "connected",
        message: "Connected to real-time notifications",
        timestamp: new Date().toISOString(),
      });

      controller.enqueue(`data: ${data}\n\n`);

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: "heartbeat",
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(`data: ${heartbeatData}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          removeConnection(connectionId);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeConnection(connectionId);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
