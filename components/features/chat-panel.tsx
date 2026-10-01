"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Send, Trash2 } from "lucide-react";
import { formatDate, getUserRoleTag } from "@/lib/utils";
import { MessageWithUser } from "@/lib/types";

interface ChatPanelProps {
  roomname: string;
  currentUser: any;
  participants: any[];
}

export function ChatPanel({ roomname, currentUser, participants }: ChatPanelProps) {
  const messages = useQuery(api.messages.getMessages, { roomName: roomname });
  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const addBlockedWord = useMutation(api.moderation.addBlockedWord);
  const removeBlockedWord = useMutation(api.moderation.removeBlockedWord);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [blockedWord, setBlockedWord] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentParticipant = participants.find((participant) => participant.userId === currentUser?._id);
  const isGuest = currentParticipant?.role === "guest";
  const isOwner = currentParticipant?.role === "owner";
  const canModerate = ["owner", "moderator"].includes(currentParticipant?.role);
  const blockedWords = useQuery(
    api.moderation.getBlockedWords,
    isOwner ? { roomName: roomname } : "skip"
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isGuest) return;

    setIsSending(true);
    try {
      await sendMessage({
        roomName: roomname,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddBlockedWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockedWord.trim()) return;

    await addBlockedWord({ roomName: roomname, word: blockedWord });
    setBlockedWord("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold text-white">Chat</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages?.map((message: MessageWithUser) => {
            const user = message.user;
            if (!user) return null;

            const canDelete = message.userId === currentUser?._id || canModerate;

            return (
              <div key={message._id} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(message.sentAt)}
                  </span>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-gray-500 hover:text-destructive"
                      onClick={() => {
                        if (window.confirm("Delete this message?")) {
                          deleteMessage({ messageId: message._id }).catch((error) => alert(error.message));
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-300">{message.content}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {isOwner && (
        <details className="border-t border-gray-700 p-4 text-sm text-gray-300">
          <summary className="cursor-pointer font-medium">Blocked words</summary>
          <form onSubmit={handleAddBlockedWord} className="mt-3 flex gap-2">
            <Input value={blockedWord} onChange={(e) => setBlockedWord(e.target.value)} placeholder="Add word" />
            <Button type="submit" size="sm">Add</Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2">
            {blockedWords?.map((word: string) => (
              <Button key={word} variant="outline" size="sm" onClick={() => removeBlockedWord({ roomName: roomname, word })}>
                {word} ×
              </Button>
            ))}
          </div>
        </details>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending || isGuest}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || isGuest || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          {isGuest
            ? "Guests can only view chat. Ask for regular status to chat."
            : "Press Enter to send"}
        </p>
      </div>
    </div>
  );
}
