import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
  args: {
    roomName: v.string(),
    content: v.string(),
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

    // Check participant role (only regulars, mods, and owners can send messages)
    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", chatroom._id).eq("userId", user._id)
      )
      .first();

    if (!participant) {
      throw new Error("You must join the chatroom first");
    }

    // Guests cannot send messages
    if (participant.role === "guest") {
      throw new Error("Guests cannot send messages. You need regular status.");
    }

    // Site admins and superusers can always send messages
    const canSend =
      user.role === "siteadmin" ||
      user.isSuperuser ||
      ["owner", "moderator", "regular"].includes(participant.role);

    if (!canSend) {
      throw new Error("You don't have permission to send messages");
    }

    const messageId = await ctx.db.insert("messages", {
      roomId: chatroom._id,
      userId: user._id,
      content: args.content,
      sentAt: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a chatroom
export const getMessages = query({
  args: {
    roomName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", chatroom._id))
      .order("desc")
      .take(args.limit || 100);

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return {
          ...msg,
          user,
        };
      })
    );

    return messagesWithUsers.reverse();
  },
});

// Send direct message (disabled for free tier)
export const sendDirectMessage = mutation({
  args: {
    roomName: v.string(),
    receiverUsername: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!sender) throw new Error("User not found");

    // Check if user has paid tier
    if (sender.tier === "free") {
      throw new Error("Direct messages are only available for paid subscribers");
    }

    const receiver = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.receiverUsername))
      .first();

    if (!receiver) throw new Error("Receiver not found");

    const chatroom = await ctx.db
      .query("chatrooms")
      .withIndex("by_name", (q) => q.eq("name", args.roomName))
      .first();

    if (!chatroom) throw new Error("Chatroom not found");

    const dmId = await ctx.db.insert("directMessages", {
      senderId: sender._id,
      receiverId: receiver._id,
      roomId: chatroom._id,
      content: args.content,
      sentAt: Date.now(),
    });

    return dmId;
  },
});
