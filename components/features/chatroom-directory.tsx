"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Video, Star, Radio } from "lucide-react";
import { ChatroomWithDetails } from "@/lib/types";
import { UsernameModal } from "./username-modal";

export function ChatroomDirectory() {
  const router = useRouter();
  const chatrooms = useQuery(api.chatrooms.getAllChatrooms);
  const favoriteRooms = useQuery(api.favorites.getFavoriteRooms);
  const currentUser = useQuery(api.users.getCurrentUser);
  const claimUsername = useMutation(api.users.claimUsername);
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  
  // Username modal state
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleClaimUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newUsername) {
      setError("Please enter a username");
      return;
    }

    if (!/^[A-Z]+$/.test(newUsername)) {
      setError("Username must be all capital letters (A-Z) only");
      return;
    }

    setIsCreating(true);
    try {
      await claimUsername({ username: newUsername });
      setNewUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chatroom");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoomClick = (roomName: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // If user has a claimed username, enter directly
    if (currentUser?.username) {
      router.push(`/${roomName}`);
      return;
    }
    
    // Otherwise show username modal
    setSelectedRoom(roomName);
    setShowUsernameModal(true);
  };

  const handleUsernameSubmit = (displayName: string) => {
    if (selectedRoom) {
      // Store the display name in sessionStorage for the chatroom to use
      sessionStorage.setItem("guestDisplayName", displayName);
      router.push(`/${selectedRoom}`);
      setShowUsernameModal(false);
      setSelectedRoom(null);
    }
  };

  const handleToggleFavorite = async (roomName: string, isFavorited: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorited) {
        await removeFavorite({ roomName });
      } else {
        await addFavorite({ roomName });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const displayedRooms = activeTab === "favorites" ? favoriteRooms : chatrooms;
  const favoriteRoomNames = new Set(favoriteRooms?.map((r: ChatroomWithDetails) => r.name) || []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4 sm:py-10">
      {/* Loading State */}
      {currentUser === undefined && (
        <Card className="rounded-[1.5rem] border-border shadow-none">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Not Found - shouldn't happen but handle it */}
      {currentUser === null && (
        <Card className="rounded-[1.5rem] border-border shadow-none">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Setting up your account...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Chatroom Section - show if user has no username */}
      {currentUser && currentUser.username === "" && (
        <Card className="rounded-[1.5rem] border-border shadow-none">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Your home base</p>
            <CardTitle className="font-display text-3xl tracking-[-0.04em]">Claim your room name</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClaimUsername} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="YOURNAME"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl text-center text-lg font-bold tracking-[0.1em]"
                  disabled={isCreating}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Your username becomes your chatroom: ezchat.cam/{newUsername || "YOURNAME"}
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full rounded-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create My Chatroom"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Chatroom */}
      {currentUser?.username && (
        <Card className="border-primary bg-primary text-primary-foreground shadow-none">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Your room</p>
            <CardTitle className="font-display text-3xl tracking-[-0.04em]">{currentUser.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/${currentUser.username}`}>
              <Button variant="secondary" className="w-full rounded-full" size="lg">
                <Video className="mr-2 h-5 w-5" />
                Enter {currentUser.username}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Chatroom Directory */}
      <Card className="overflow-hidden rounded-[1.5rem] border-border shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Radio className="h-3.5 w-3.5" /> Live directory</p><CardTitle className="font-display mt-2 text-3xl tracking-[-0.04em]">Find a room</CardTitle></div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveTab("all")}
              >
                All Rooms
              </Button>
              <Button
                variant={activeTab === "favorites" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveTab("favorites")}
              >
                <Star className="h-4 w-4 mr-1" />
                Favorites
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!displayedRooms && (
            <div className="text-center py-8 text-muted-foreground">
              Loading chatrooms...
            </div>
          )}
          
          {displayedRooms && displayedRooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {activeTab === "favorites" 
                ? "No favorite rooms yet. Click the star icon to add favorites!" 
                : "No active chatrooms yet. Be the first to create one!"}
            </div>
          )}

          <div className="grid gap-3">
            {displayedRooms?.map((room: ChatroomWithDetails) => (
              <div
                key={room._id}
                onClick={(e) => handleRoomClick(room.name, e)}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between border-t border-border px-1 py-5 transition-colors hover:bg-secondary sm:px-4">
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.035em]">{room.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Hosted by {room.ownerUsername}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{room.participantCount}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleToggleFavorite(room.name, favoriteRoomNames.has(room.name), e)}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          favoriteRoomNames.has(room.name)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground group-hover:text-yellow-400"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Username Selection Modal */}
      {selectedRoom && (
        <UsernameModal
          isOpen={showUsernameModal}
          onClose={() => {
            setShowUsernameModal(false);
            setSelectedRoom(null);
          }}
          onSubmit={handleUsernameSubmit}
          roomName={selectedRoom}
        />
      )}
    </div>
  );
}
