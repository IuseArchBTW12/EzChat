import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced with Clerk)
  users: defineTable({
    clerkId: v.string(),
    username: v.string(), // ALL CAPS only (A-Z)
    email: v.string(),
    imageUrl: v.optional(v.string()),
    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("extreme"),
      v.literal("gold")
    ),
    role: v.union(
      v.literal("user"),
      v.literal("siteadmin"),
      v.literal("superuser")
    ),
    isSuperuser: v.boolean(), // Invisible in chatroom userlist
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  // Chatrooms (each username IS a chatroom)
  chatrooms: defineTable({
    name: v.string(), // ALL CAPS (matches username)
    ownerId: v.id("users"),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Room participants & roles
  roomParticipants: defineTable({
    roomId: v.id("chatrooms"),
    userId: v.id("users"),
    displayName: v.optional(v.string()), // Guest display name (if no username)
    role: v.union(
      v.literal("owner"),
      v.literal("moderator"),
      v.literal("regular"),
      v.literal("guest")
    ),
    joinedAt: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Ban list
  bans: defineTable({
    roomId: v.id("chatrooms"),
    userId: v.id("users"),
    bannedById: v.id("users"),
    reason: v.optional(v.string()),
    isSitewideBan: v.boolean(),
    bannedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Messages
  messages: defineTable({
    roomId: v.id("chatrooms"),
    userId: v.id("users"),
    content: v.string(),
    sentAt: v.number(),
  }).index("by_room", ["roomId"]),

  // Direct Messages (disabled for free tier)
  directMessages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    roomId: v.id("chatrooms"), // DMs are within chatrooms
    content: v.string(),
    sentAt: v.number(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_room", ["roomId"]),

  // WebRTC signaling
  webrtcSignals: defineTable({
    roomId: v.id("chatrooms"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    signal: v.string(), // JSON stringified peer signal
    type: v.union(v.literal("offer"), v.literal("answer"), v.literal("ice")),
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_to_user", ["toUserId"]),

  // Favorite rooms
  favoriteRooms: defineTable({
    userId: v.id("users"),
    roomId: v.id("chatrooms"),
    favoritedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_room", ["roomId"])
    .index("by_user_and_room", ["userId", "roomId"]),
});
