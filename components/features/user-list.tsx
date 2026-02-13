"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserRoleTag, getTierLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Ban,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
} from "lucide-react";

interface UserListProps {
  participants: any[];
  currentUser: any;
  roomname: string;
}

export function UserList({ participants, currentUser, roomname }: UserListProps) {
  const assignModerator = useMutation(api.moderation.assignModerator);
  const assignRegular = useMutation(api.moderation.assignRegular);
  const kickUser = useMutation(api.moderation.kickUser);
  const banUser = useMutation(api.moderation.banUser);

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentParticipant = participants.find(
    (p) => p.user?._id === currentUser?._id
  );

  const canModerate =
    currentUser?.role === "siteadmin" ||
    currentUser?.isSuperuser ||
    currentParticipant?.role === "owner" ||
    currentParticipant?.role === "moderator";

  const handleAction = async (
    action: "mod" | "regular" | "kick" | "ban",
    username: string
  ) => {
    setActionLoading(true);
    try {
      switch (action) {
        case "mod":
          await assignModerator({ roomName: roomname, targetUsername: username });
          break;
        case "regular":
          await assignRegular({ roomName: roomname, targetUsername: username });
          break;
        case "kick":
          await kickUser({ roomName: roomname, targetUsername: username });
          break;
        case "ban":
          await banUser({ roomName: roomname, targetUsername: username });
          break;
      }
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold text-white">
          Users ({participants.length})
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {participants.map((participant) => {
            const user = participant.user;
            if (!user) return null;

            const roleTag = getUserRoleTag(participant.role);
            const tierLabel = getTierLabel(user.tier);
            const isSelected = selectedUser === user.username;

            return (
              <div
                key={participant._id}
                className="group relative"
              >
                <div
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-700 transition-colors ${
                    isSelected ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {tierLabel && (
                        <span className="px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                          {tierLabel}
                        </span>
                      )}
                      <span className="text-sm font-medium text-white truncate">
                        {participant.displayName || user.username}
                        {roleTag && (
                          <span className="ml-1 text-gray-400">({roleTag})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {canModerate && user._id !== currentUser._id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() =>
                        setSelectedUser(isSelected ? null : user.username)
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Action Menu */}
                {isSelected && canModerate && (
                  <div className="absolute right-2 top-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1 z-10 min-w-40">
                    {currentParticipant?.role === "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => handleAction("mod", user.username)}
                        disabled={actionLoading}
                      >
                        <Shield className="mr-2 h-3 w-3" />
                        Make Moderator
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleAction("regular", user.username)}
                      disabled={actionLoading}
                    >
                      <UserCheck className="mr-2 h-3 w-3" />
                      Make Regular
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleAction("kick", user.username)}
                      disabled={actionLoading}
                    >
                      <UserX className="mr-2 h-3 w-3" />
                      Kick
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-destructive"
                      onClick={() => handleAction("ban", user.username)}
                      disabled={actionLoading}
                    >
                      <Ban className="mr-2 h-3 w-3" />
                      Ban
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
