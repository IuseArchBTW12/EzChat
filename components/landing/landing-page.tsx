"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { RoomScene } from "@/components/landing/room-scene";
import { ChatroomDirectory } from "@/components/features/chatroom-directory";
import { Video, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserSync } from "@/components/user-sync";
import Link from "next/link";

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Video className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-semibold tracking-[-0.04em]">
                EZCHAT
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                How It Works
              </a>
              <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="rounded-full px-5">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              {/* Mobile menu button */}
              <button
                className="rounded-full p-2 text-foreground hover:bg-secondary md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-border py-4 md:hidden">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Add padding for fixed nav */}
      <div className="h-16" />

      {/* Content based on auth state */}
      <SignedOut>
        <Hero />
        <div id="features">
          <Features />
        </div>
        <RoomScene />
        <HowItWorks />
        <CTA />
        <Footer />
      </SignedOut>

      <SignedIn>
        <UserSync />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ChatroomDirectory />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
