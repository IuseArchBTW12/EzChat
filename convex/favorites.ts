import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add room to favorites
export const addFavorite = mutation({
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

    // Check if already favorited
    const existing = await ctx.db
      .query("favoriteRooms")
      .withIndex("by_user_and_room", (q) =>
        q.eq("userId", user._id).eq("roomId", chatroom._id)
      )
      .first();

    if (existing) {
      return existing._id; // Already favorited
    }

    // Add to favorites
    const favoriteId = await ctx.db.insert("favoriteRooms", {
      userId: user._id,
      roomId: chatroom._id,
      favoritedAt: Date.now(),
    });

    return favoriteId;
  },
});

// Remove room from favorites
export const removeFavorite = mutation({
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

    const favorite = await ctx.db
      .query("favoriteRooms")
      .withIndex("by_user_and_room", (q) =>
        q.eq("userId", user._id).eq("roomId", chatroom._id)
      )
      .first();

    if (favorite) {
      await ctx.db.delete(favorite._id);
    }
  },
});

// Get user's favorite rooms
export const getFavoriteRooms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const favorites = await ctx.db
      .query("favoriteRooms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const favoritesWithDetails = await Promise.all(
      favorites.map(async (fav) => {
        const room = await ctx.db.get(fav.roomId);
        if (!room) return null;

        const owner = await ctx.db.get(room.ownerId);
        const participants = await ctx.db
          .query("roomParticipants")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .filter((q) => q.eq(q.field("isOnline"), true))
          .collect();

        return {
          ...room,
          participantCount: participants.length,
          ownerUsername: owner?.username || "Unknown",
          favoritedAt: fav.favoritedAt,
        };
      })
    );

    return favoritesWithDetails.filter((r) => r !== null);
  },
});

// Check if room is favorited
export const isFavorited = query({
  args: { roomName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) return false;

    const favorite = await ctx.db
      .query("favoriteRooms")
      .withIndex("by_user_and_room", (q) =>
        q.eq("userId", user._id).eq("roomId", chatroom._id)
      )
      .first();

    return !!favorite;
  },
});
