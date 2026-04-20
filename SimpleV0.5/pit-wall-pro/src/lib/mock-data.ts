import type { LiveRaceState, LiveDriver, SafetyCarStatus } from "@/types/f1";

// Simulated live race data generator (used for both live and replay modes)
export function generateMockDriver(index: number, lapOffset: number = 0): LiveDriver {
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

  const getSectorTime = (base: number) => {
    const time = (base + Math.random() * 0.5).toFixed(3);
    const rand = Math.random();
    if (rand > 0.95) return `${time}*`; // Fastest Lap (Purple)
    if (rand > 0.7) return `${time}+`;  // Personal Best (Green)
    return time;
  };

  // Adjust position based on lap offset to simulate overtakes
  const basePos = index + 1;
  const shiftedPos = ((basePos + Math.floor(lapOffset / 5)) % 20) + 1;

  return {
    position: shiftedPos,
    driverNumber: d.num,
    driverCode: d.code,
    driverName: d.name,
    teamName: d.team,
    teamColor: d.color,
    gap: shiftedPos === 1 ? "LEADER" : `+${(shiftedPos * 1.234 + Math.random() * 0.5).toFixed(3)}s`,
    interval: shiftedPos === 1 ? "—" : `+${(1.234 + Math.random() * 0.3).toFixed(3)}s`,
    lastLap: `1:${String(17 + Math.floor(Math.random() * 3)).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    bestLap: `1:${String(16 + Math.floor(Math.random() * 2)).padStart(2, "0")}.${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    sector1: getSectorTime(24.2),
    sector2: getSectorTime(36.5),
    sector3: getSectorTime(21.8),
    tireCompound: compounds[Math.floor(Math.random() * 3)],
    tireAge: (Math.floor(Math.random() * 10) + lapOffset) % 40,
    pitStops: Math.floor(lapOffset / 20),
    drsActive: Math.random() > 0.6,
    status: "ON_TRACK",
    speed: Math.floor(Math.random() * 100) + 250,
    throttle: Math.floor(Math.random() * 30) + 70,
    brake: Math.floor(Math.random() * 20),
  };
}

export function generateMockLiveRace(currentLap: number = 12, scStatus: SafetyCarStatus = "NONE"): LiveRaceState {
  return {
    sessionName: "FORMULA 1 LIVE SESSION",
    trackName: "Live Telemetry Circuit",
    currentLap: currentLap,
    totalLaps: 57,
    raceStatus: scStatus === "NONE" ? "RACING" : "SAFETY_CAR",
    safetyCarStatus: scStatus,
    timeElapsed: `${Math.floor(currentLap * 1.5)}:12`,
    timeRemaining: `${String(57 - currentLap).padStart(2, "0")} LAPS`,
    trackTemp: 38 + Math.floor(Math.random() * 10),
    airTemp: 28 + Math.floor(Math.random() * 5),
    humidity: 35 + Math.floor(Math.random() * 15),
    windSpeed: 10 + Math.floor(Math.random() * 20),
    drsEnabled: scStatus === "NONE",
    drivers: Array.from({ length: 20 }, (_, i) => generateMockDriver(i, currentLap)),
  };
}
