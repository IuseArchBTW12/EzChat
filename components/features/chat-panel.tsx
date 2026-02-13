"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { formatDate, getUserRoleTag } from "@/lib/utils";
import { MessageWithUser } from "@/lib/types";

interface ChatPanelProps {
  roomname: string;
  currentUser: any;
}

export function ChatPanel({ roomname, currentUser }: ChatPanelProps) {
  const messages = useQuery(api.messages.getMessages, { roomName: roomname });
  const sendMessage = useMutation(api.messages.sendMessage);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

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

            return (
              <div key={message._id} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(message.sentAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{message.content}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          {currentUser?.role === "guest"
            ? "Guests can only view chat. Ask for regular status to chat."
            : "Press Enter to send"}
        </p>
      </div>
    </div>
  );
}
