import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function validateUsername(username: string): boolean {
  return /^[A-Z]+$/.test(username);
}

export function getUserRoleTag(role: string): string {
  switch (role) {
    case "owner":
    case "moderator":
      return "m";
    case "regular":
      return "r";
    default:
      return "";
  }
}

export function getTierLabel(tier: string): string {
  switch (tier) {
    case "pro":
      return "PRO";
    case "extreme":
      return "EXTREME";
    case "gold":
      return "GOLD";
    default:
      return "";
  }
}

export function getMaxCams(tier: string): { rows: number; cols: number } {
  if (tier === "free") {
    return { rows: 4, cols: 3 };
  }
  return { rows: 5, cols: 4 };
}
