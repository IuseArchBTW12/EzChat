import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Assign moderator role
export const assignModerator = mutation({
  args: {
    roomName: v.string(),
    targetUsername: v.string(),
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

    // Only room owner can assign moderators
    if (chatroom.ownerId !== user._id) {
      throw new Error("Only room owner can assign moderators");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();

    if (!targetUser) throw new Error("Target user not found");

    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", targetUser._id)
      )
      .first();

    if (!participant) {
      throw new Error("User is not in the chatroom");
    }

    await ctx.db.patch(participant._id, {
      role: "moderator",
    });
  },
});

// Assign regular role
export const assignRegular = mutation({
  args: {
    roomName: v.string(),
    targetUsername: v.string(),
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

    // Only owner or moderators can assign regular status
    if (!participant || !["owner", "moderator"].includes(participant.role)) {
      throw new Error("Only owner and moderators can assign regular status");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();

    if (!targetUser) throw new Error("Target user not found");

    const targetParticipant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", targetUser._id)
      )
      .first();

    if (!targetParticipant) {
      throw new Error("User is not in the chatroom");
    }

    await ctx.db.patch(targetParticipant._id, {
      role: "regular",
    });
  },
});

// Kick user from chatroom
export const kickUser = mutation({
  args: {
    roomName: v.string(),
    targetUsername: v.string(),
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

    if (!participant || !["owner", "moderator"].includes(participant.role)) {
      throw new Error("Only owner and moderators can kick users");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();

    if (!targetUser) throw new Error("Target user not found");

    // Site admins are immune
    if (targetUser.role === "siteadmin" || targetUser.isSuperuser) {
      throw new Error("Cannot kick site admins");
    }

    const targetParticipant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", targetUser._id)
      )
      .first();

    if (!targetParticipant) {
      throw new Error("User is not in the chatroom");
    }

    // Moderators can only kick guests and regulars
    if (participant.role === "moderator") {
      if (!["guest", "regular"].includes(targetParticipant.role)) {
        throw new Error("Moderators can only kick guests and regulars");
      }
    }

    await ctx.db.patch(targetParticipant._id, {
      isOnline: false,
    });
  },
});

// Ban user from chatroom
export const banUser = mutation({
  args: {
    roomName: v.string(),
    targetUsername: v.string(),
    reason: v.optional(v.string()),
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

    if (!participant || !["owner", "moderator"].includes(participant.role)) {
      throw new Error("Only owner and moderators can ban users");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();

    if (!targetUser) throw new Error("Target user not found");

    // Site admins are immune
    if (targetUser.role === "siteadmin" || targetUser.isSuperuser) {
      throw new Error("Cannot ban site admins");
    }

    const targetParticipant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", targetUser._id)
      )
      .first();

    // Moderators can only ban guests and regulars
    if (participant.role === "moderator" && targetParticipant) {
      if (!["guest", "regular"].includes(targetParticipant.role)) {
        throw new Error("Moderators can only ban guests and regulars");
      }
    }

    // Kick user if online
    if (targetParticipant) {
      await ctx.db.patch(targetParticipant._id, {
        isOnline: false,
      });
    }

    // Add to ban list
    await ctx.db.insert("bans", {
      roomId: chatroom._id,
      userId: targetUser._id,
      bannedById: user._id,
      reason: args.reason,
      isSitewideBan: false,
      bannedAt: Date.now(),
    });
  },
});

// Unban user
export const unbanUser = mutation({
  args: {
    roomName: v.string(),
    targetUsername: v.string(),
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

    if (!participant || !["owner", "moderator"].includes(participant.role)) {
      throw new Error("Only owner and moderators can unban users");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();

    if (!targetUser) throw new Error("Target user not found");

    const ban = await ctx.db
      .query("bans")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", targetUser._id)
      )
      .first();

    if (ban && !ban.isSitewideBan) {
      await ctx.db.delete(ban._id);
    }
  },
});

// Site-wide ban (admins only)
export const sitewideBan = mutation({
  args: {
    targetUsername: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Only site admins can issue site-wide bans
    if (user.role !== "siteadmin") {
      throw new Error("Only site admins can issue site-wide bans");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();

    if (!targetUser) throw new Error("Target user not found");

    // Get all chatrooms
    const chatrooms = await ctx.db.query("chatrooms").collect();

    // Ban from all chatrooms
    for (const chatroom of chatrooms) {
      const existingBan = await ctx.db
        .query("bans")
        .withIndex("by_room_and_user", (q) =>
          q.eq("roomId", chatroom._id).eq("userId", targetUser._id)
        )
        .first();

      if (!existingBan) {
        await ctx.db.insert("bans", {
          roomId: chatroom._id,
          userId: targetUser._id,
          bannedById: user._id,
          reason: args.reason,
          isSitewideBan: true,
          bannedAt: Date.now(),
        });
      }
    }
  },
});

// Get ban list for a chatroom
export const getBanList = query({
  args: { roomName: v.string() },
  handler: async (ctx, args) => {
    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) return [];

    const bans = await ctx.db
      .query("bans")
      .withIndex("by_room", (q) => q.eq("roomId", chatroom._id))
      .collect();

    const bansWithUsers = await Promise.all(
      bans.map(async (ban) => {
        const user = await ctx.db.get(ban.userId);
        const bannedBy = await ctx.db.get(ban.bannedById);
        return {
          ...ban,
          user,
          bannedBy,
        };
      })
    );

    return bansWithUsers;
  },
});
