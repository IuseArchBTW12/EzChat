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
  const processedSignals = useRef<Set<string>>(new Set());
  const cameraStatusSet = useRef(false);
  const assignedStreams = useRef<Map<string, string>>(new Map()); // Track username -> streamId to prevent duplicate assignments
  const playingVideos = useRef<Set<string>>(new Set()); // Track which videos are currently playing/being set up
  const sendSignal = useMutation(api.webrtc.sendSignal);
  const deleteSignal = useMutation(api.webrtc.deleteSignal);
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
    if (localStream && currentUser && !cameraStatusSet.current) {
      const videoElement = videoRefs.current.get(currentUser.username);
      if (videoElement && videoElement.srcObject !== localStream) {
        videoElement.srcObject = localStream;
      }
      
      // Notify server that camera is on (only once)
      console.log(`[WebRTC] Setting camera ON for ${currentUser.username}`);
      toggleCamera({ roomName: roomname, hasCameraOn: true })
        .then(() => {
          cameraStatusSet.current = true;
        })
        .catch((err) => {
          console.error("Failed to toggle camera status:", err);
        });
    }
  }, [localStream, currentUser, roomname, toggleCamera]);

  // Create peer connections for other participants
  useEffect(() => {
    if (!localStream || !currentUser) return;

    const otherParticipants = participants.filter(
      (p) => p.user && 
             p.user._id !== currentUser._id && 
             p.user.username && 
             p.user.username.trim() !== '' && 
             p.hasCameraOn === true
    );

    console.log(`[WebRTC] Current user: ${currentUser.username}, Other participants with camera:`, otherParticipants.map(p => p.user.username));

    otherParticipants.forEach((participant) => {
      const username = participant.user.username;
      
      // Skip if peer already exists
      if (peersRef.current.has(username)) {
        console.log(`[WebRTC] Peer already exists for ${username}`);
        return;
      }

      // Create new peer connection (initiator = true for alphabetically lower username)
      const shouldInitiate = currentUser.username < username;
      
      console.log(`[WebRTC] Creating peer for ${username}, shouldInitiate: ${shouldInitiate}`);
      
      const peer = new Peer({
        initiator: shouldInitiate,
        stream: localStream,
        trickle: false,
      });

      peer.on("signal", (signalData) => {
        console.log(`[WebRTC] Sending signal to ${username}, type: ${signalData.type}`);
        sendSignal({
          roomName: roomname,
          toUsername: username,
          signal: JSON.stringify(signalData),
          type: signalData.type === "offer" ? "offer" : "answer",
        }).catch((err) => console.error("Failed to send signal:", err));
      });

      peer.on("stream", (remoteStream) => {
        console.log(`[WebRTC] ✅ Received stream from ${username}`, remoteStream);
        console.log(`[WebRTC] Stream tracks:`, remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}, readyState: ${t.readyState}`));
        console.log(`[WebRTC] Stream active:`, remoteStream.active);
        console.log(`[WebRTC] Stream ID:`, remoteStream.id);
        
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(username, remoteStream);
          return newMap;
        });
        
        // Immediately assign stream to video element if it exists
        setTimeout(() => {
          const videoElement = videoRefs.current.get(username);
          const alreadyAssignedStreamId = assignedStreams.current.get(username);
          
          // Only assign if not already assigned or if it's a different stream
          if (videoElement && alreadyAssignedStreamId !== remoteStream.id) {
            console.log(`[WebRTC] 🎥 Assigning received stream to ${username}`);
            console.log(`[WebRTC] Stream ID:`, remoteStream.id);
            
            videoElement.srcObject = remoteStream;
            assignedStreams.current.set(username, remoteStream.id);
            
            videoElement.play()
              .then(() => {
                console.log(`[WebRTC] ✅ Playing ${username} video successfully`);
              })
              .catch(err => console.error(`[WebRTC] ❌ Failed to play ${username}:`, err));
          } else if (alreadyAssignedStreamId === remoteStream.id) {
            console.log(`[WebRTC] ⏭️ Stream already assigned to ${username}, skipping`);
          } else {
            console.log(`[WebRTC] ⚠️ Video element not yet mounted for ${username}`);
          }
        }, 150);
      });

      peer.on("connect", () => {
        console.log(`[WebRTC] ✅ Connected to ${username}`);
      });

      peer.on("error", (err) => {
        console.error(`[WebRTC] ❌ Peer error with ${username}:`, err);
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
        console.log(`[WebRTC] Cleaning up peer for ${username} (left room)`);
        peer.destroy();
        peersRef.current.delete(username);
        assignedStreams.current.delete(username); // Clear assignment tracking
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

      // Skip already processed signals
      const signalKey = `${signalData._id}`;
      if (processedSignals.current.has(signalKey)) return;

      const peer = peersRef.current.get(fromUsername);
      if (!peer) {
        console.log(`[WebRTC] No peer found for ${fromUsername}, cannot process signal`);
        return;
      }

      try {
        const signal = JSON.parse(signalData.signal);
        console.log(`[WebRTC] Processing signal from ${fromUsername}, type: ${signal.type}`);
        peer.signal(signal);
        processedSignals.current.add(signalKey);
        
        // Delete signal after processing
        deleteSignal({ signalId: signalData._id }).catch((err) => {
          console.error("Failed to delete signal:", err);
        });
      } catch (err) {
        console.error(`[WebRTC] Failed to process signal from ${fromUsername}:`, err);
      }
    });
  }, [signals, currentUser, deleteSignal]);

  // Assign remote streams to video elements (only if not already assigned)
  useEffect(() => {
    if (remoteStreams.size > 0) {
      console.log(`[WebRTC] 📺 Checking stream sync. Streams:`, Array.from(remoteStreams.keys()));
    }
    remoteStreams.forEach((stream, username) => {
      const videoElement = videoRefs.current.get(username);
      const alreadyAssignedStreamId = assignedStreams.current.get(username);
      
      if (videoElement && alreadyAssignedStreamId !== stream.id) {
        console.log(`[WebRTC] 📺 Syncing stream to ${username} (not yet assigned)`);
        videoElement.srcObject = stream;
        assignedStreams.current.set(username, stream.id);
        videoElement.play()
          .then(() => console.log(`[WebRTC] ✅ ${username} playing after sync`))
          .catch(err => console.error(`[WebRTC] ❌ Play failed for ${username}:`, err));
      } else if (alreadyAssignedStreamId === stream.id) {
        console.log(`[WebRTC] ⏭️ Stream already assigned to ${username}`);
      }
    });
  }, [remoteStreams, participants]); // Add participants to re-run when DOM updates

  // Calculate grid layout - filter out invalid participants
  const visibleParticipants = participants
    .filter((p) => p.user && p.user.username && p.user.username.trim() !== '')
    .slice(0, maxVideos);
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
                    if (el) {
                      videoRefs.current.set(user.username, el);
                      
                      if (isCurrentUser && localStream) {
                        // Always assign local stream immediately
                        if (el.srcObject !== localStream) {
                          console.log(`[WebRTC] 🎥 Assigning LOCAL stream to ${user.username}`);
                          el.srcObject = localStream;
                          el.play().catch(err => console.error(`Failed to play local video:`, err));
                        }
                      } else {
                        // For remote users, check if stream is already assigned to THIS element
                        const stream = remoteStreams.get(user.username);
                        const alreadyAssignedStreamId = assignedStreams.current.get(user.username);
                        
                        // Only assign if we haven't already assigned this stream (prevent re-assignment on remount)
                        if (stream && alreadyAssignedStreamId !== stream.id) {
                          console.log(`[WebRTC] 🎥 Assigning remote stream to ${user.username} on mount`);
                          el.srcObject = stream;
                          assignedStreams.current.set(user.username, stream.id);
                          playingVideos.current.add(user.username);
                          
                          el.play()
                            .then(() => {
                              console.log(`[WebRTC] ✅ ${user.username} video playing`);
                              playingVideos.current.delete(user.username);
                            })
                            .catch(err => {
                              console.error(`[WebRTC] ❌ Failed to play ${user.username}:`, err);
                              playingVideos.current.delete(user.username);
                            });
                        } else if (stream && alreadyAssignedStreamId === stream.id) {
                          // Already assigned, but element is new (remount) - just set srcObject
                          if (el.srcObject !== stream) {
                            console.log(`[WebRTC] 🔄 Re-setting stream on remounted ${user.username} element`);
                            el.srcObject = stream;
                            el.play().catch(() => {}); // Silently try to play
                          }
                        }
                      }
                    } else {
                      videoRefs.current.delete(user.username);
                      assignedStreams.current.delete(user.username);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={isCurrentUser}
                  className="w-full h-full object-contain bg-black"
                  style={{ minHeight: '200px' }}
                />
                
                {/* User label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-sm font-medium">
                    {user.username}
                    {isCurrentUser && " (You)"}
                  </p>
                  {/* Debug indicator */}
                  <p className="text-xs text-gray-400">
                    {remoteStreams.has(user.username) ? "📡 Stream" : "⏳ Waiting"}
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
