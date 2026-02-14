import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user from Clerk
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user (username will be set separately)
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: "", // Will be set when user claims a username
      email: args.email,
      imageUrl: args.imageUrl,
      tier: "free",
      role: "user",
      isSuperuser: false,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Claim a username (creates chatroom and makes user the owner)
export const claimUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate username (ALL CAPS, A-Z only)
    if (!/^[A-Z]+$/.test(args.username)) {
      throw new Error("Username must be all capital letters (A-Z) only");
    }

    // Check if username is already taken by another user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUser) {
      throw new Error("Username already taken");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user already has a username
    if (user.username) {
      throw new Error("You already have a username");
    }

    // Update user with username
    await ctx.db.patch(user._id, {
      username: args.username,
    });

    // Create chatroom with user as owner
    const roomId = await ctx.db.insert("chatrooms", {
      name: args.username,
      ownerId: user._id,
      isActive: true,
      createdAt: Date.now(),
    });

    // Add user as owner in roomParticipants
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

// Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Get user by username
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return user;
  },
});

// Update user tier (for billing integration)
export const updateUserTier = mutation({
  args: {
    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("extreme"),
      v.literal("gold")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      tier: args.tier,
    });
  },
});
