"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Video, Star } from "lucide-react";
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

  // Debug logging
  console.log("ChatroomDirectory - currentUser:", currentUser);

  const displayedRooms = activeTab === "favorites" ? favoriteRooms : chatrooms;
  const favoriteRoomNames = new Set(favoriteRooms?.map((r: ChatroomWithDetails) => r.name) || []);

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {currentUser === undefined && (
        <Card>
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
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Claim Your Username</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClaimUsername} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="YOURNAME"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toUpperCase())}
                  className="text-center text-lg font-bold"
                  disabled={isCreating}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Your username becomes your chatroom: ezchat.cam/{newUsername || "YOURNAME"}
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create My Chatroom"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Chatroom */}
      {currentUser?.username && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>My Chatroom</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/${currentUser.username}`}>
              <Button className="w-full" size="lg">
                <Video className="mr-2 h-5 w-5" />
                Enter {currentUser.username}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Chatroom Directory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chatrooms</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
              >
                All Rooms
              </Button>
              <Button
                variant={activeTab === "favorites" ? "default" : "outline"}
                size="sm"
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
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Owner: {room.ownerUsername}
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
