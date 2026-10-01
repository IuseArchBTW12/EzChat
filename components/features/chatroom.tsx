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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] mb-2">
            {isCreating ? "Creating Chatroom..." : "Loading..."}
          </h2>
          <p className="text-muted-foreground">
            {isCreating ? `Setting up ${roomname}` : "Please wait"}
          </p>
        </div>
      </div>
    );
  }

  if (!chatroom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] mb-2">
            Chatroom Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Live room</p><h1 className="font-display text-xl font-semibold tracking-[-0.035em]">{roomname}</h1></div>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Owner: {chatroom.ownerUsername}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* User List - Left */}
        <aside className="hidden w-60 border-r border-border bg-card xl:block">
          <UserList
            participants={participants || []}
            currentUser={currentUser}
            roomname={roomname}
          />
        </aside>

        {/* Video Grid - Center */}
        <main className="min-h-0 flex-1 bg-background lg:min-w-0">
          <VideoGrid
            participants={participants || []}
            currentUser={currentUser}
            roomname={roomname}
          />
        </main>

        {/* Chat Panel - Right */}
        <aside className="h-[38dvh] w-full border-t border-border bg-card lg:h-auto lg:w-80 lg:border-l lg:border-t-0">
          <ChatPanel
            roomname={roomname}
            currentUser={currentUser}
            participants={participants || []}
          />
        </aside>
      </div>
    </div>
  );
}
