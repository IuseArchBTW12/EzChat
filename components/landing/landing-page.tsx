"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { ChatroomDirectory } from "@/components/features/chatroom-directory";
import { Video, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserSync } from "@/components/user-sync";

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EzChat
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-foreground/70 hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-foreground/70 hover:text-blue-600 font-medium transition-colors"
              >
                How It Works
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-foreground/70 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-foreground/70 hover:text-blue-600 font-medium"
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
