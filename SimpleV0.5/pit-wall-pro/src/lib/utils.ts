import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TEAM_COLORS, COUNTRY_FLAGS, type TireCompound } from "@/types/f1";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId.toLowerCase()] || "#8E8E93";
}

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "🏁";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`;
}

export function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

export function pad(num: number): string {
  return String(num).padStart(2, "0");
}

export function formatGap(gap: number): string {
  if (gap === 0) return "LEADER";
  if (gap > 0) return `+${gap.toFixed(3)}s`;
  return `${gap.toFixed(3)}s`;
}

export function getTireColor(compound: TireCompound): string {
  const colors: Record<TireCompound, string> = {
    SOFT: "#FF1801",
    MEDIUM: "#FCD700",
    HARD: "#FFFFFF",
    INTERMEDIATE: "#39B54A",
    WET: "#0067FF",
  };
  return colors[compound] || "#8E8E93";
}

export function getPositionColor(position: number): string {
  if (position === 1) return "#FCD700";
  if (position === 2) return "#C0C0C0";
  if (position === 3) return "#CD7F32";
  return "#FFFFFF";
}

export function formatRaceName(name: string): string {
  return name.replace(/ Grand Prix$/, "").toUpperCase();
}

export function formatDriverCode(code?: string): string {
  return code?.toUpperCase() || "???";
}

export function calculateCountdown(targetDate: string, targetTime?: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const target = new Date(`${targetDate}T${targetTime || "14:00:00"}Z`).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    total: diff,
  };
}

export function getSessionStatus(date: string, time?: string): "upcoming" | "live" | "past" {
  const target = new Date(`${date}T${time || "14:00:00"}Z`).getTime();
  const now = Date.now();
  const raceEnd = target + 2 * 60 * 60 * 1000; // +2 hours

  if (now < target) return "upcoming";
  if (now > raceEnd) return "past";
  return "live";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function getRaceRoundLabel(round: string, total: number): string {
  return `ROUND ${round.padStart(2, "0")} / ${total}`;
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}
