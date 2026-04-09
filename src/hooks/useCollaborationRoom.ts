import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CollaborationEvent } from "@/types";
import { useAuthStore } from "@/stores/auth.store";

type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";

function toWSBase(httpBase?: string) {
  if (!httpBase) return "";
  if (httpBase.startsWith("https://")) return httpBase.replace("https://", "wss://");
  if (httpBase.startsWith("http://")) return httpBase.replace("http://", "ws://");
  return httpBase;
}

export function useCollaborationRoom(inspectionId: string) {
  const user = useAuthStore((state) => state.user);
  const org = useAuthStore((state) => state.org);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [state, setState] = useState<ConnectionState>("idle");
  const socketRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    const base = toWSBase(process.env.NEXT_PUBLIC_API_URL);
    if (!base || !inspectionId) return "";
    return `${base}/api/v1/collaborate/${inspectionId}/ws`;
  }, [inspectionId]);

  const sendEvent = useCallback((event: CollaborationEvent) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(event));
    setEvents((current) => [...current, { ...event, created_at: new Date().toISOString() }]);
    return true;
  }, []);

  useEffect(() => {
    if (!wsUrl || !user?.id) return;

    setState("connecting");
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setState("open");
      const joinedEvent: CollaborationEvent = {
        type: "user_joined",
        payload: { name: user.name, role: user.role },
        user_id: user.id,
        org_id: org?.id,
        created_at: new Date().toISOString(),
      };
      ws.send(JSON.stringify(joinedEvent));
      setEvents((current) => [...current, joinedEvent]);
    };

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as CollaborationEvent;
        setEvents((current) => [...current, { ...event, created_at: new Date().toISOString() }]);
      } catch {
        setEvents((current) => [
          ...current,
          {
            type: "message",
            payload: String(message.data),
            user_id: "unknown",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    };

    ws.onerror = () => setState("error");
    ws.onclose = () => setState("closed");

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "user_left",
          payload: { name: user.name },
          user_id: user.id,
          org_id: org?.id,
          created_at: new Date().toISOString(),
        } satisfies CollaborationEvent));
      }
      ws.close();
      socketRef.current = null;
    };
  }, [org?.id, user?.id, user?.name, user?.role, wsUrl]);

  return {
    events,
    connectionState: state,
    sendEvent,
  };
}
