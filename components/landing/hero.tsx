"use client";

import { useEffect, useRef } from "react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Users, Zap } from "lucide-react";
import gsap from "gsap";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });

      // Feature cards stagger animation
      gsap.from(".feature-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Floating animation for gradient orbs
      gsap.to(".gradient-orb-1", {
        y: -30,
        x: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".gradient-orb-2", {
        y: 30,
        x: -20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900"
    >
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-20 dark:opacity-10 gradient-orb-1" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-20 dark:opacity-10 gradient-orb-2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Main heading */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
        >
          Your Username.
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Chatroom.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Create instant video chatrooms with just a username. No setup, no hassle.
          Just claim your name and start connecting.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <SignInButton mode="modal">
            <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignInButton>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2"
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See How It Works
          </Button>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="feature-card bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Video className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Instant Video Rooms
            </h3>
            <p className="text-muted-foreground">
              Start face-to-face conversations instantly. No downloads, no waiting.
            </p>
          </div>

          <div className="feature-card bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Users className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Role-Based Control
            </h3>
            <p className="text-muted-foreground">
              Manage your room with moderators, regulars, and guests.
            </p>
          </div>

          <div className="feature-card bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Lightning Fast
            </h3>
            <p className="text-muted-foreground">
              Powered by WebRTC for seamless, real-time video connections.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
