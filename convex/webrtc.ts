import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send WebRTC signal
export const sendSignal = mutation({
  args: {
    roomName: v.string(),
    toUsername: v.string(),
    signal: v.string(),
    type: v.union(v.literal("offer"), v.literal("answer"), v.literal("ice")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const fromUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!fromUser) throw new Error("User not found");

    const toUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.toUsername))
      .first();

    if (!toUser) throw new Error("Target user not found");

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) throw new Error("Chatroom not found");

    const signalId = await ctx.db.insert("webrtcSignals", {
      roomId: chatroom._id,
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      signal: args.signal,
      type: args.type,
      createdAt: Date.now(),
    });

    return signalId;
  },
});

// Get signals for current user
export const getSignals = query({
  args: { roomName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) return [];

    const signals = await ctx.db
      .query("webrtcSignals")
      .withIndex("by_to_user", (q) => q.eq("toUserId", user._id))
      .filter((q) => q.eq(q.field("roomId"), chatroom._id))
      .collect();

    const signalsWithUsers = await Promise.all(
      signals.map(async (signal) => {
        const fromUser = await ctx.db.get(signal.fromUserId);
        return {
          ...signal,
          fromUser,
        };
      })
    );

    return signalsWithUsers;
  },
});

// Delete signal after consumption
export const deleteSignal = mutation({
  args: { signalId: v.id("webrtcSignals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.signalId);
  },
});

// Clear old signals (cleanup)
export const clearSignals = mutation({
  args: { roomName: v.string() },
  handler: async (ctx, args) => {
    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) return;

    // Delete signals older than 1 minute
    const oneMinuteAgo = Date.now() - 60000;
    const oldSignals = await ctx.db
      .query("webrtcSignals")
      .withIndex("by_room", (q) => q.eq("roomId", chatroom._id))
      .filter((q) => q.lt(q.field("createdAt"), oneMinuteAgo))
      .collect();

    for (const signal of oldSignals) {
      await ctx.db.delete(signal._id);
    }
  },
});
