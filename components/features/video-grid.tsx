"use client";

import { useEffect, useRef, useState } from "react";
import { getMaxCams } from "@/lib/utils";
import Peer from "simple-peer";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface VideoGridProps {
  participants: any[];
  currentUser: any;
  roomname: string;
}

export function VideoGrid({ participants, currentUser, roomname }: VideoGridProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, Peer.Instance>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const sendSignal = useMutation(api.webrtc.sendSignal);
  const signals = useQuery(api.webrtc.getSignals, { roomName: roomname });

  const maxCams = getMaxCams(currentUser?.tier || "free");
  const maxVideos = maxCams.rows * maxCams.cols;

  // Get local video stream
  useEffect(() => {
    let mounted = true;

    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { max: 30 },
          },
          audio: false, // No mics per requirements
        });
        
        if (mounted) {
          setLocalStream(stream);
        } else {
          // Component unmounted, stop tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (mounted) {
          // Don't alert, just log - camera might not be available
          console.warn("Camera access denied or not available");
        }
      }
    };

    getCamera();

    return () => {
      mounted = false;
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [localStream]);

  // Set local video
  useEffect(() => {
    if (localStream && currentUser) {
      const videoElement = videoRefs.current.get(currentUser.username);
      if (videoElement) {
        videoElement.srcObject = localStream;
      }
    }
  }, [localStream, currentUser]);

  // Calculate grid layout
  const visibleParticipants = participants.slice(0, maxVideos);
  const gridCols = Math.min(visibleParticipants.length, maxCams.cols);
  const gridRows = Math.ceil(visibleParticipants.length / gridCols);

  return (
    <div className="h-full p-4">
      {!localStream && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg mb-2">Requesting camera access...</p>
            <p className="text-gray-400 text-sm">
              Please allow camera access to continue
            </p>
          </div>
        </div>
      )}

      {localStream && (
        <div
          className="grid h-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          }}
        >
          {visibleParticipants.map((participant) => {
            const user = participant.user;
            if (!user) return null;

            const isCurrentUser = user._id === currentUser?._id;

            return (
              <div
                key={participant._id}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(user.username, el);
                  }}
                  autoPlay
                  playsInline
                  muted={isCurrentUser}
                  className="w-full h-full object-cover"
                />
                
                {/* User label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-sm font-medium">
                    {user.username}
                    {isCurrentUser && " (You)"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {participants.length > maxVideos && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium">
          {participants.length - maxVideos} more users (upgrade for larger grid)
        </div>
      )}
    </div>
  );
}
