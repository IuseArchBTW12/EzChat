"use client";

import { useEffect, useRef, useState } from "react";
import { getMaxCams } from "@/lib/utils";
import Peer from "simple-peer";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mic, MicOff, MonitorUp, Video, VideoOff } from "lucide-react";

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
  const [playingUsers, setPlayingUsers] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
  const processedSignals = useRef<Set<string>>(new Set());
  const receivedOffers = useRef<Set<string>>(new Set());
  const cameraStatusSet = useRef(false);
  const sendSignal = useMutation(api.webrtc.sendSignal);
  const deleteSignal = useMutation(api.webrtc.deleteSignal);
  const toggleCamera = useMutation(api.chatrooms.toggleCamera);
  const signals = useQuery(api.webrtc.getSignals, { roomName: roomname });

  useEffect(() => {
    const loadDevices = () => navigator.mediaDevices.enumerateDevices().then((devices) => {
      setAudioInputs(devices.filter((device) => device.kind === "audioinput"));
      setVideoInputs(devices.filter((device) => device.kind === "videoinput"));
    });
    loadDevices();
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);
    return () => navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
  }, []);

  useEffect(() => {
    if (!localStream || isMuted) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(localStream);
    const samples = new Uint8Array(analyser.fftSize);
    source.connect(analyser);
    const timer = window.setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      setIsSpeaking(samples.some((sample) => Math.abs(sample - 128) > 8));
    }, 150);
    return () => { window.clearInterval(timer); context.close(); };
  }, [localStream, isMuted]);

  const maxCams = getMaxCams(currentUser?.tier || "free");
  const maxVideos = maxCams.rows * maxCams.cols;

  // Get local video stream
  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const getCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { max: 30 },
          },
          audio: true,
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
      stream?.getTracks().forEach((track) => track.stop());
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
             p.isOnline === true
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
        receivedOffers.current.delete(username);
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

      const newerSignalExists = signals.some(
        (candidate) =>
          candidate._id !== signalData._id &&
          candidate.fromUserId === signalData.fromUserId &&
          candidate.type === signalData.type &&
          candidate.createdAt > signalData.createdAt
      );
      if (newerSignalExists) {
        processedSignals.current.add(signalKey);
        deleteSignal({ signalId: signalData._id }).catch((err) => {
          console.error("Failed to delete stale signal:", err);
        });
        return;
      }

      const peer = peersRef.current.get(fromUsername);
      if (!peer) {
        console.log(`[WebRTC] No peer found for ${fromUsername}, cannot process signal`);
        return;
      }
      if (peer.destroyed) {
        processedSignals.current.add(signalKey);
        deleteSignal({ signalId: signalData._id }).catch(console.error);
        return;
      }

      try {
        const signal = JSON.parse(signalData.signal);
        if (signal.type === "offer" && receivedOffers.current.has(fromUsername)) {
          processedSignals.current.add(signalKey);
          deleteSignal({ signalId: signalData._id }).catch(console.error);
          return;
        }
        console.log(`[WebRTC] Processing signal from ${fromUsername}, type: ${signal.type}`);
        if (signal.type === "offer") receivedOffers.current.add(fromUsername);
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
  }, [signals, peers, currentUser, deleteSignal]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    localStream?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted; });
    setIsMuted(nextMuted);
  };

  const toggleVideo = () => {
    const nextCameraOn = !isCameraOn;
    localStream?.getVideoTracks().forEach((track) => { track.enabled = nextCameraOn; });
    toggleCamera({ roomName: roomname, hasCameraOn: nextCameraOn }).catch(console.error);
    setIsCameraOn(nextCameraOn);
  };

  const stopSharing = (stream: MediaStream) => {
    const screenTrack = stream.getVideoTracks()[0];
    const cameraTrack = localStream?.getVideoTracks()[0];
    if (screenTrack && cameraTrack && localStream) {
      peersRef.current.forEach((peer) => peer.replaceTrack(screenTrack, cameraTrack, localStream));
    }
    if (screenTrack) screenTrack.onended = null;
    stream.getTracks().forEach((track) => track.stop());
    setScreenStream(null);
  };

  const shareScreen = async () => {
    if (!localStream) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const screenTrack = stream.getVideoTracks()[0];
      const cameraTrack = localStream.getVideoTracks()[0];
      if (!screenTrack || !cameraTrack) return;
      peersRef.current.forEach((peer) => peer.replaceTrack(cameraTrack, screenTrack, localStream));
      screenTrack.onended = () => stopSharing(stream);
      setScreenStream(stream);
    } catch (error) {
      if ((error as DOMException).name !== "NotAllowedError") console.error("Failed to share screen:", error);
    }
  };

  const changeInput = async (kind: "audio" | "video", deviceId: string) => {
    if (!localStream) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: kind === "audio" ? { deviceId: { exact: deviceId } } : false,
      video: kind === "video" ? { deviceId: { exact: deviceId } } : false,
    });
    const oldTrack = kind === "audio" ? localStream.getAudioTracks()[0] : localStream.getVideoTracks()[0];
    const newTrack = kind === "audio" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    if (!oldTrack || !newTrack) return;
    peersRef.current.forEach((peer) => peer.replaceTrack(oldTrack, newTrack, localStream));
    localStream.removeTrack(oldTrack);
    oldTrack.stop();
    localStream.addTrack(newTrack);
  };

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
                className={`relative overflow-hidden rounded-lg bg-gray-800 ${isCurrentUser && isSpeaking ? "ring-2 ring-green-400" : ""}`}
                style={{
                  aspectRatio: '16 / 9',
                }}
              >
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current.set(user.username, el);
                      
                      if (isCurrentUser && localStream) {
                        const previewStream = screenStream ?? localStream;
                        // Always assign local stream immediately
                        if (el.srcObject !== previewStream) {
                          console.log(`[WebRTC] 🎥 Assigning LOCAL stream to ${user.username}`);
                          el.srcObject = previewStream;
                          el.play().catch(err => console.error(`Failed to play local video:`, err));
                        }
                      } else {
                        const stream = remoteStreams.get(user.username);
                        if (stream && el.srcObject !== stream) {
                          el.srcObject = stream;
                        }
                      }
                    } else {
                      videoRefs.current.delete(user.username);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={isCurrentUser}
                  onLoadedMetadata={(event) => event.currentTarget.play().catch(() => {})}
                  onPlaying={() => setPlayingUsers((previous) => new Set(previous).add(user.username))}
                  onWaiting={() => setPlayingUsers((previous) => {
                    const next = new Set(previous);
                    next.delete(user.username);
                    return next;
                  })}
                  className="w-full h-full object-contain bg-black"
                  style={{ minHeight: '200px' }}
                />
                
                {/* User label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-sm font-medium">
                    {user.username}
                    {isCurrentUser && " (You)"}
                    {isCurrentUser && isMuted && <MicOff className="ml-2 inline h-4 w-4 text-red-400" />}
                  </p>
                  {/* Debug indicator */}
                  <p className="text-xs text-gray-400">
                    {isCurrentUser
                      ? localStream ? "📹 You" : "⏳ Waiting"
                      : playingUsers.has(user.username) ? "📡 Stream" : "⏳ Waiting"}
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
      {localStream && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-gray-800 p-2 shadow-lg">
          <button type="button" aria-label={isMuted ? "Unmute microphone" : "Mute microphone"} onClick={toggleMute} className="rounded-full p-3 text-white hover:bg-gray-700">
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button type="button" aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"} onClick={toggleVideo} className="rounded-full p-3 text-white hover:bg-gray-700">
            {isCameraOn ? <Video /> : <VideoOff />}
          </button>
          <button type="button" aria-label={screenStream ? "Stop screen sharing" : "Share screen"} onClick={() => screenStream ? stopSharing(screenStream) : shareScreen()} className="rounded-full p-3 text-white hover:bg-gray-700">
            <MonitorUp />
          </button>
          <select aria-label="Microphone" className="max-w-32 rounded bg-gray-700 px-2 text-xs text-white" onChange={(event) => changeInput("audio", event.target.value)}>
            {audioInputs.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}
          </select>
          <select aria-label="Camera" className="max-w-32 rounded bg-gray-700 px-2 text-xs text-white" onChange={(event) => changeInput("video", event.target.value)}>
            {videoInputs.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
