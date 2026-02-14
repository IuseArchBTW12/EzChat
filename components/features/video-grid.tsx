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
  const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
  const sendSignal = useMutation(api.webrtc.sendSignal);
  const toggleCamera = useMutation(api.chatrooms.toggleCamera);
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
  }, []); // Empty array - only run once on mount

  // Set local video and notify server camera is on
  useEffect(() => {
    if (localStream && currentUser) {
      const videoElement = videoRefs.current.get(currentUser.username);
      if (videoElement && videoElement.srcObject !== localStream) {
        videoElement.srcObject = localStream;
      }
      
      // Notify server that camera is on
      toggleCamera({ roomName: roomname, hasCameraOn: true }).catch((err) => {
        console.error("Failed to toggle camera status:", err);
      });
    }
    
    // Cleanup: Turn camera off when component unmounts or stream is lost
    return () => {
      if (currentUser) {
        toggleCamera({ roomName: roomname, hasCameraOn: false }).catch((err) => {
          console.error("Failed to toggle camera status:", err);
        });
      }
    };
  }, [localStream, currentUser, roomname, toggleCamera]);

  // Create peer connections for other participants
  useEffect(() => {
    if (!localStream || !currentUser) return;

    const otherParticipants = participants.filter(
      (p) => p.user && p.user._id !== currentUser._id && p.hasCameraOn
    );

    otherParticipants.forEach((participant) => {
      const username = participant.user.username;
      
      // Skip if peer already exists
      if (peersRef.current.has(username)) return;

      // Create new peer connection (initiator = true for alphabetically lower username)
      const shouldInitiate = currentUser.username < username;
      
      const peer = new Peer({
        initiator: shouldInitiate,
        stream: localStream,
        trickle: false,
      });

      peer.on("signal", (signalData) => {
        sendSignal({
          roomName: roomname,
          toUsername: username,
          signal: JSON.stringify(signalData),
          type: signalData.type === "offer" ? "offer" : "answer",
        }).catch((err) => console.error("Failed to send signal:", err));
      });

      peer.on("stream", (remoteStream) => {
        console.log(`Received stream from ${username}`);
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(username, remoteStream);
          return newMap;
        });
        
        // Assign stream to video element
        const videoElement = videoRefs.current.get(username);
        if (videoElement) {
          videoElement.srcObject = remoteStream;
        }
      });

      peer.on("error", (err) => {
        console.error(`Peer error with ${username}:`, err);
      });

      peersRef.current.set(username, peer);
      setPeers(new Map(peersRef.current));
    });

    // Clean up peers for participants who left
    peersRef.current.forEach((peer, username) => {
      const stillPresent = otherParticipants.some(
        (p) => p.user?.username === username
      );
      if (!stillPresent) {
        peer.destroy();
        peersRef.current.delete(username);
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.delete(username);
          return newMap;
        });
      }
    });

    setPeers(new Map(peersRef.current));
  }, [participants, localStream, currentUser, roomname, sendSignal]);

  // Handle incoming signals
  useEffect(() => {
    if (!signals || !currentUser) return;

    signals.forEach((signalData) => {
      const fromUsername = signalData.fromUser?.username;
      if (!fromUsername) return;

      const peer = peersRef.current.get(fromUsername);
      if (!peer) return;

      try {
        const signal = JSON.parse(signalData.signal);
        peer.signal(signal);
      } catch (err) {
        console.error("Failed to process signal:", err);
      }
    });
  }, [signals, currentUser]);

  // Assign remote streams to video elements
  useEffect(() => {
    remoteStreams.forEach((stream, username) => {
      const videoElement = videoRefs.current.get(username);
      if (videoElement && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

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
          className="grid gap-4 w-full h-full content-start p-4"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gridAutoRows: 'min-content',
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
                style={{
                  aspectRatio: '16 / 9',
                }}
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(user.username, el);
                  }}
                  autoPlay
                  playsInline
                  muted={isCurrentUser}
                  className="w-full h-full object-contain bg-black"
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
