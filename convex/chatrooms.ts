import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all active chatrooms for directory (only show rooms with at least one camera on)
export const getAllChatrooms = query({
  handler: async (ctx) => {
    const chatrooms = await ctx.db
      .query("chatrooms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get participant counts for each room and filter by camera status
    const chatroomsWithCounts = await Promise.all(
      chatrooms.map(async (room) => {
        const participants = await ctx.db
          .query("roomParticipants")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .filter((q) => q.eq(q.field("isOnline"), true))
          .collect();

        const participantsWithCamera = participants.filter((p) => p.hasCameraOn);
        const owner = await ctx.db.get(room.ownerId);

        return {
          ...room,
          participantCount: participants.length,
          cameraCount: participantsWithCamera.length,
          ownerUsername: owner?.username || "Unknown",
        };
      })
    );

    // Only return rooms with at least one person on camera
    return chatroomsWithCounts.filter((room) => room.cameraCount > 0);
  },
});

// Get or create chatroom by name
export const getOrCreateChatroom = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate roomname (ALL CAPS, A-Z only)
    if (!/^[A-Z]+$/.test(args.name)) {
      throw new Error("Chatroom name must be all capital letters (A-Z) only");
    }

    // Check if chatroom exists
    const existing = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      return existing._id;
    }

    // Get current user to be the owner
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Create new chatroom
    const roomId = await ctx.db.insert("chatrooms", {
      name: args.name,
      ownerId: user._id,
      isActive: true,
      createdAt: Date.now(),
    });

    // Add creator as owner participant
    await ctx.db.insert("roomParticipants", {
      roomId,
      userId: user._id,
      role: "owner",
      joinedAt: Date.now(),
      isOnline: false,
      hasCameraOn: false,
    });

    return roomId;
  },
});

// Get chatroom by name
export const getChatroomByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!chatroom) return null;

    const owner = await ctx.db.get(chatroom.ownerId);

    return {
      ...chatroom,
      ownerUsername: owner?.username || "Unknown",
    };
  },
});

// Join a chatroom
export const joinChatroom = mutation({
  args: {
    roomName: v.string(),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) throw new Error("Chatroom not found");

    // Check if user is banned
    const ban = await ctx.db
      .query("bans")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", user._id)
      )
      .first();

    if (ban) {
      throw new Error("You are banned from this chatroom");
    }

    // Check if already a participant
    const existingParticipant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", user._id)
      )
      .first();

    if (existingParticipant) {
      // Update to online and displayName if provided
      await ctx.db.patch(existingParticipant._id, {
        isOnline: true,
        ...(args.displayName && { displayName: args.displayName }),
      });
      return existingParticipant._id;
    }

    // Add as guest by default
    const participantId = await ctx.db.insert("roomParticipants", {
      roomId: chatroom._id,
      userId: user._id,
      displayName: args.displayName,
      role: "guest",
      joinedAt: Date.now(),
      isOnline: true,
      hasCameraOn: false, // Camera off by default
    });

    return participantId;
  },
});

// Leave chatroom
export const leaveChatroom = mutation({
  args: {
    roomName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) throw new Error("Chatroom not found");

    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", user._id)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        isOnline: false,
      });
    }
  },
});

// Get chatroom participants
export const getChatroomParticipants = query({
  args: { roomName: v.string() },
  handler: async (ctx, args) => {
    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) return [];

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", chatroom._id))
      .filter((q) => q.eq(q.field("isOnline"), true))
      .collect();

    const participantsWithUsers = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          user,
        };
      })
    );

    // Filter out superusers and sort
    const visibleParticipants = participantsWithUsers
      .filter((p) => !p.user?.isSuperuser)
      .sort((a, b) => {
        // Paid accounts first
        const tierOrder = { gold: 0, extreme: 1, pro: 2, free: 3 };
        const aTier = tierOrder[a.user?.tier || "free"];
        const bTier = tierOrder[b.user?.tier || "free"];
        if (aTier !== bTier) return aTier - bTier;

        // Owner/moderators next
        const roleOrder = { owner: 0, moderator: 1, regular: 2, guest: 3 };
        const aRole = roleOrder[a.role];
        const bRole = roleOrder[b.role];
        if (aRole !== bRole) return aRole - bRole;

        // Then by join time
        return a.joinedAt - b.joinedAt;
      });

    return visibleParticipants;
  },
});

// Toggle camera status
export const toggleCamera = mutation({
  args: {
    roomName: v.string(),
    hasCameraOn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) throw new Error("Chatroom not found");

    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", user._id)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        hasCameraOn: args.hasCameraOn,
      });
    }
  },
});
