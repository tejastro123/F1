"use client";

import { useEffect, useRef } from "react";
import type { LiveRaceState, LiveDriver, SafetyCarStatus } from "@/types/f1";
import { useLiveRaceStore } from "@/store/f1Store";
import { useUserStore } from "@/store/f1Store";

import { generateMockLiveRace } from "@/lib/mock-data";

export function useLiveRace() {
  const { setLiveRace, setConnected } = useLiveRaceStore();
  const { addNotification } = useUserStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Connect to the Next.js Server-Sent Events (SSE) stream for live telemetry
    const evtSource = new EventSource("/api/live-timing");
    eventSourceRef.current = evtSource;

    evtSource.onopen = () => {
      setConnected(true);
      setLiveRace(generateMockLiveRace());
      addNotification({
        type: "success",
        title: "📡 Connection Established",
        message: "Successfully connected to live telemetry stream.",
        priority: "medium",
      });
    };

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle Live Streaming Events
        switch (data.type) {
          case "RACE_CONTROL_MESSAGE":
            addNotification({
              type: data.flag === "YELLOW" ? "warning" : "info",
              title: `🏁 Race Control [${data.flag}]`,
              message: data.message,
              priority: data.flag === "YELLOW" ? "critical" : "medium",
            });
            // Update UI state based on track conditions
            setLiveRace(generateMockLiveRace(12, data.flag === "YELLOW" ? "VIRTUAL_SAFETY_CAR" : "NONE"));
            break;

          case "TELEMETRY_UPDATE":
            // Update the live board with new streaming data
            setLiveRace(generateMockLiveRace(data.lap));
            break;

          case "CONNECTION_ESTABLISHED":
            console.log("Stream sync active:", data.status);
            break;
        }
      } catch (err) {
        console.error("Failed to parse live telemetry stream", err);
      }
    };

    evtSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      setConnected(false);
      evtSource.close();

      addNotification({
        type: "error",
        title: "❌ Connection Lost",
        message: "Telemetry stream disconnected. Attempting to reconnect...",
        priority: "critical",
      });
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setConnected(false);
    };
  }, [setLiveRace, setConnected, addNotification]);
}
