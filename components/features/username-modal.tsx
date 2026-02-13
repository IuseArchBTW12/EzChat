"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (displayName: string) => void;
  roomName: string;
  isLoading?: boolean;
}

export function UsernameModal({ isOpen, onClose, onSubmit, roomName, isLoading }: UsernameModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    if (displayName.length < 2) {
      setError("Display name must be at least 2 characters");
      return;
    }

    if (displayName.length > 20) {
      setError("Display name must be less than 20 characters");
      return;
    }

    if (!/^[A-Z0-9]+$/i.test(displayName)) {
      setError("Display name can only contain letters and numbers");
      return;
    }

    onSubmit(displayName.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-blue-600" />
            Choose Your Display Name
          </DialogTitle>
          <DialogDescription>
            Enter a display name to join <span className="font-bold">{roomName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="GUESTNAME"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
              className="text-center text-lg font-semibold"
              maxLength={20}
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Letters and numbers only, 2-20 characters
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !displayName.trim()}>
              {isLoading ? "Joining..." : "Join Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
