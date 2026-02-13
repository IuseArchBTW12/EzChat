import { Doc, Id } from "@/convex/_generated/dataModel";

// Extended types for components with joined data
export interface MessageWithUser extends Doc<"messages"> {
  user: Doc<"users"> | null;
}

export interface ChatroomWithDetails extends Doc<"chatrooms"> {
  participantCount: number;
  ownerUsername: string;
}

export interface ParticipantWithUser extends Doc<"roomParticipants"> {
  user: Doc<"users">;
}

// User role types
export type UserTier = "free" | "pro" | "extreme" | "gold";
export type UserRole = "user" | "siteadmin" | "superuser";
export type RoomRole = "owner" | "moderator" | "regular" | "guest";

// Subscription tier limits
export const TIER_LIMITS = {
  free: {
    maxCams: 12, // 4x3
    maxResolution: "360p",
    canDM: false,
  },
  pro: {
    maxCams: 20, // 5x4
    maxResolution: "360p",
    canDM: true,
  },
  extreme: {
    maxCams: 20, // 5x4
    maxResolution: "360p",
    canDM: true,
  },
  gold: {
    maxCams: 20, // 5x4
    maxResolution: "360p",
    canDM: true,
  },
} as const;

// WebRTC constraints
export const VIDEO_CONSTRAINTS = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 360 },
    aspectRatio: { ideal: 16 / 9 },
    frameRate: { ideal: 15, max: 30 },
  },
  audio: false, // No mics per requirements
} as const;
