"use client";

import { useEffect, useRef } from "react";
import type { LiveRaceState, LiveDriver, SafetyCarStatus } from "@/types/f1";
import { useLiveRaceStore } from "@/store/f1Store";
import { useUserStore } from "@/store/f1Store";

// Simulated live race data generator (used to fill the telemetry board)
function generateMockDriver(index: number): LiveDriver {
  const drivers = [
    { code: "VER", name: "Max Verstappen", team: "red_bull", color: "#0600EF", num: "1" },
    { code: "NOR", name: "Lando Norris", team: "mclaren", color: "#FF8700", num: "4" },
    { code: "LEC", name: "Charles Leclerc", team: "ferrari", color: "#DC0000", num: "16" },
    { code: "PIA", name: "Oscar Piastri", team: "mclaren", color: "#FF8700", num: "81" },
    { code: "SAI", name: "Carlos Sainz", team: "ferrari", color: "#DC0000", num: "55" },
    { code: "HAM", name: "Lewis Hamilton", team: "mercedes", color: "#27F4D2", num: "44" },
    { code: "RUS", name: "George Russell", team: "mercedes", color: "#27F4D2", num: "63" },
    { code: "ALO", name: "Fernando Alonso", team: "aston_martin", color: "#229971", num: "14" },
    { code: "STR", name: "Lance Stroll", team: "aston_martin", color: "#229971", num: "18" },
    { code: "GAS", name: "Pierre Gasly", team: "alpine", color: "#0093CC", num: "10" },
    { code: "OCO", name: "Esteban Ocon", team: "alpine", color: "#0093CC", num: "31" },
    { code: "ALB", name: "Alexander Albon", team: "williams", color: "#64C4FF", num: "23" },
    { code: "COL", name: "Franco Colapinto", team: "williams", color: "#64C4FF", num: "43" },
    { code: "TSU", name: "Yuki Tsunoda", team: "racing_bulls", color: "#6692FF", num: "22" },
    { code: "LAW", name: "Liam Lawson", team: "racing_bulls", color: "#6692FF", num: "30" },
    { code: "HUL", name: "Nico Hulkenberg", team: "haas", color: "#B6BABD", num: "27" },
    { code: "MAG", name: "Kevin Magnussen", team: "haas", color: "#B6BABD", num: "20" },
    { code: "PER", name: "Sergio Perez", team: "red_bull", color: "#0600EF", num: "11" },
    { code: "BOT", name: "Valtteri Bottas", team: "sauber", color: "#52e252", num: "77" },
    { code: "ZHO", name: "Guanyu Zhou", team: "sauber", color: "#52e252", num: "24" },
  ];

  const d = drivers[index % drivers.length];
  const compounds: LiveDriver["tireCompound"][] = ["SOFT", "MEDIUM", "HARD"];

  return {
    position: index + 1,
    driverNumber: d.num,
    driverCode: d.code,
    driverName: d.name,
    teamName: d.team,
    teamColor: d.color,
    gap: index === 0 ? "LEADER" : `+${(index * 1.234 + Math.random() * 0.5).toFixed(3)}s`,
    interval: index === 0 ? "—" : `+${(1.234 + Math.random() * 0.3).toFixed(3)}s`,
    lastLap: `1:${String(17 + Math.floor(Math.random() * 3)).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    bestLap: `1:${String(16 + Math.floor(Math.random() * 2)).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    sector1: `${String(Math.floor(Math.random() * 9) + 20).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    sector2: `${String(Math.floor(Math.random() * 9) + 28).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    sector3: `${String(Math.floor(Math.random() * 9) + 18).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    tireCompound: compounds[Math.floor(Math.random() * 3)],
    tireAge: Math.floor(Math.random() * 30) + 1,
    pitStops: Math.floor(Math.random() * 2),
    drsActive: Math.random() > 0.6,
    status: "ON_TRACK",
    speed: Math.floor(Math.random() * 100) + 250,
    throttle: Math.floor(Math.random() * 30) + 70,
    brake: Math.floor(Math.random() * 20),
  };
}

function generateMockLiveRace(currentLap: number = 12, scStatus: SafetyCarStatus = "NONE"): LiveRaceState {
  return {
    sessionName: "FORMULA 1 LIVE SESSION",
    trackName: "Live Telemetry Circuit",
    currentLap: currentLap,
    totalLaps: 57,
    raceStatus: scStatus === "NONE" ? "RACING" : "SAFETY_CAR",
    safetyCarStatus: scStatus,
    timeElapsed: `00:45:12`,
    timeRemaining: `${String(57 - currentLap).padStart(2, "0")} LAPS`,
    trackTemp: 38 + Math.floor(Math.random() * 10),
    airTemp: 28 + Math.floor(Math.random() * 5),
    humidity: 35 + Math.floor(Math.random() * 15),
    windSpeed: 10 + Math.floor(Math.random() * 20),
    drsEnabled: scStatus === "NONE",
    drivers: Array.from({ length: 20 }, (_, i) => generateMockDriver(i)),
  };
}

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
        priority: "normal",
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
              priority: data.flag === "YELLOW" ? "critical" : "normal",
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
