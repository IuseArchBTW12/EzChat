"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { UserList } from "./user-list";
import { VideoGrid } from "./video-grid";
import { ChatPanel } from "./chat-panel";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ChatroomProps {
  roomname: string;
}

export function Chatroom({ roomname }: ChatroomProps) {
  const router = useRouter();
  const { user } = useUser();
  const chatroom = useQuery(api.chatrooms.getChatroomByName, { name: roomname });
  const participants = useQuery(api.chatrooms.getChatroomParticipants, { roomName: roomname });
  const currentUser = useQuery(api.users.getCurrentUser);
  const getOrCreateChatroom = useMutation(api.chatrooms.getOrCreateChatroom);
  const joinChatroom = useMutation(api.chatrooms.joinChatroom);
  const leaveChatroom = useMutation(api.chatrooms.leaveChatroom);

  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Auto-create chatroom if it doesn't exist
  useEffect(() => {
    if (user && chatroom === null && !isCreating) {
      setIsCreating(true);
      getOrCreateChatroom({ name: roomname })
        .then(() => {
          console.log(`Chatroom ${roomname} created or found`);
        })
        .catch((err) => {
          console.error("Failed to create chatroom:", err);
          setError(err.message);
        })
        .finally(() => {
          setIsCreating(false);
        });
    }
  }, [user, chatroom, roomname, isCreating, getOrCreateChatroom]);

  useEffect(() => {
    if (user && chatroom && !hasJoined) {
      // Get guest display name from sessionStorage if user doesn't have a username
      const guestDisplayName = sessionStorage.getItem("guestDisplayName");
      const displayName = currentUser?.username ? undefined : guestDisplayName || undefined;
      
      // Clear the session storage after using it
      if (guestDisplayName) {
        sessionStorage.removeItem("guestDisplayName");
      }

      joinChatroom({ 
        roomName: roomname,
        ...(displayName && { displayName })
      })
        .then(() => setHasJoined(true))
        .catch((err) => {
          setError(err.message);
        });
    }

    return () => {
      if (hasJoined) {
        leaveChatroom({ roomName: roomname }).catch(console.error);
      }
    };
  }, [user, chatroom, roomname, hasJoined, currentUser, joinChatroom, leaveChatroom]);

  // Show loading state while creating chatroom
  if (isCreating || chatroom === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isCreating ? "Creating Chatroom..." : "Loading..."}
          </h2>
          <p className="text-gray-600">
            {isCreating ? `Setting up ${roomname}` : "Please wait"}
          </p>
        </div>
      </div>
    );
  }

  if (!chatroom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chatroom Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The chatroom &quot;{roomname}&quot; doesn&apos;t exist yet
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">{roomname}</h1>
          </div>
          <p className="text-sm text-gray-400">
            Owner: {chatroom.ownerUsername}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* User List - Left */}
        <aside className="w-60 bg-gray-800 border-r border-gray-700">
          <UserList
            participants={participants || []}
            currentUser={currentUser}
            roomname={roomname}
          />
        </aside>

        {/* Video Grid - Center */}
        <main className="flex-1 bg-gray-900">
          <VideoGrid
            participants={participants || []}
            currentUser={currentUser}
            roomname={roomname}
          />
        </main>

        {/* Chat Panel - Right */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700">
          <ChatPanel
            roomname={roomname}
            currentUser={currentUser}
          />
        </aside>
      </div>
    </div>
  );
}
