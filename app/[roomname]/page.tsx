import { Chatroom } from "@/components/features/chatroom";
import { notFound } from "next/navigation";

interface ChatroomPageProps {
  params: Promise<{
    roomname: string;
  }>;
}

export default async function ChatroomPage({ params }: ChatroomPageProps) {
  const { roomname } = await params;
  
  // Validate roomname (must be all caps, no numbers or special characters)
  const isValidRoomname = /^[A-Z]+$/.test(roomname);
  
  if (!isValidRoomname) {
    notFound();
  }

  return <Chatroom roomname={roomname} />;
}
