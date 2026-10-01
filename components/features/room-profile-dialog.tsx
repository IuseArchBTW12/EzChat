"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

export function RoomProfileDialog({ roomname, description, imageUrl }: { roomname: string; description?: string; imageUrl?: string }) {
  const updateProfile = useMutation(api.chatrooms.updateRoomProfile);
  const [open, setOpen] = useState(false);
  const [nextDescription, setNextDescription] = useState(description ?? "");
  const [nextImageUrl, setNextImageUrl] = useState(imageUrl ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setNextDescription(description ?? ""); setNextImageUrl(imageUrl ?? ""); } }, [open, description, imageUrl]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ roomName: roomname, description: nextDescription, imageUrl: nextImageUrl });
      setOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not update room profile");
    } finally {
      setSaving(false);
    }
  };

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="sm" className="hidden rounded-full border-white/10 bg-white/5 text-[#f6f2ea] hover:bg-white/10 hover:text-[#f6f2ea] sm:inline-flex"><Settings2 className="mr-2 h-3.5 w-3.5" />Room profile</Button></DialogTrigger>
    <DialogContent className="border-white/10 bg-[#17140f] text-[#f6f2ea] sm:rounded-2xl">
      <DialogHeader><DialogTitle className="font-display text-3xl">Shape your room</DialogTitle><DialogDescription className="text-[#f6f2ea]/55">This appears in the live directory. Use a direct image or GIF URL for the cover.</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm font-medium">Room description<textarea value={nextDescription} onChange={(event) => setNextDescription(event.target.value)} maxLength={280} rows={4} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#27211c] p-3 text-sm text-[#f6f2ea] outline-none focus:ring-2 focus:ring-primary" placeholder="What is this room about?" /></label>
        <label className="block text-sm font-medium">Cover image or GIF URL<Input value={nextImageUrl} onChange={(event) => setNextImageUrl(event.target.value)} className="mt-2 border-white/10 bg-[#27211c] text-[#f6f2ea]" placeholder="https://..." /></label>
        <Button type="submit" className="w-full rounded-full" disabled={saving}>{saving ? "Saving..." : "Save room profile"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}
