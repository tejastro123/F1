/**
 * Official F1 Team & Driver Color System
 * Extracted from FastF1 styles and team branding
 */

export const TEAM_COLORS_FASTF1: Record<string, string> = {
  "Red Bull Racing": "#3671C6",
  "Mercedes": "#27F4D2",
  "Ferrari": "#E80020",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine": "#0093CC",
  "Williams": "#64C4FF",
  "RB": "#6692FF",
  "Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
  "AlphaTauri": "#2B4562",
  "Alfa Romeo": "#900000",
  "Aston Martin Aramco": "#229971",
  "MoneyGram Haas F1 Team": "#B6BABD",
  "Stake F1 Team Kick Sauber": "#52E252"
};

export const DRIVER_COLORS: Record<string, string> = {
  "VER": "#3671C6",
  "PER": "#3671C6",
  "HAM": "#27F4D2",
  "RUS": "#27F4D2",
  "LEC": "#E80020",
  "SAI": "#E80020",
  "NOR": "#FF8000",
  "PIA": "#FF8000",
  "ALO": "#229971",
  "STR": "#229971",
  "GAS": "#0093CC",
  "OCO": "#0093CC",
  "ALB": "#64C4FF",
  "SAR": "#64C4FF",
  "RIC": "#6692FF",
  "TSU": "#6692FF",
  "BOT": "#52E252",
  "ZHO": "#52E252",
  "MAG": "#B6BABD",
  "HUL": "#B6BABD"
};

export function getDriverColor(driverCode?: string): string {
  if (!driverCode) return "#8E8E93";
  return DRIVER_COLORS[driverCode.toUpperCase()] || "#FFFFFF";
}

export function getTeamColorFastF1(teamName: string): string {
  if (!teamName) return "#8E8E93";
  // Try exact match first
  if (TEAM_COLORS_FASTF1[teamName]) return TEAM_COLORS_FASTF1[teamName];
  
  // Try partial match
  for (const [key, value] of Object.entries(TEAM_COLORS_FASTF1)) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) return value;
  }
  
  return "#8E8E93";
}

export function getTireColor(compound?: string): string {
  if (!compound) return "#8E8E93";
  const c = compound.toUpperCase();
  if (c.includes("SOFT")) return "#FF1801";
  if (c.includes("MEDIUM")) return "#FCD700";
  if (c.includes("HARD")) return "#FFFFFF";
  if (c.includes("INTER")) return "#39B54A";
  if (c.includes("WET")) return "#0067FF";
  return "#8E8E93";
}
