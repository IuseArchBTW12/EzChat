"use client";

import { Shield, MessageSquare, Crown, Ban, Users2, Lock, Video, Zap, UserCheck, Globe, Clock, Sparkles } from "lucide-react";

const mainFeatures = [
  {
    icon: Crown,
    title: "Own Your Space",
    description:
      "Your username is your chatroom. Full ownership and control from day one.",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    icon: Video,
    title: "Instant Video Chat",
    description:
      "Start face-to-face conversations instantly with WebRTC. No downloads required.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Advanced Moderation",
    description:
      "Comprehensive tools to manage your community. Kick, ban, and assign roles effortlessly.",
    gradient: "from-purple-500 to-purple-600",
  },
];

const allFeatures = [
  {
    icon: Users2,
    title: "Role-Based Permissions",
    description: "Owner, Moderator, Regular, and Guest roles with granular control.",
  },
  {
    icon: MessageSquare,
    title: "Smart Chat Control",
    description: "Decide who can text chat. Guests can watch, regulars can participate.",
  },
  {
    icon: Ban,
    title: "Ban Management",
    description: "Room-specific ban lists to keep troublemakers out permanently.",
  },
  {
    icon: Lock,
    title: "Privacy Focused",
    description: "Video-only (no mics), capped at 360p for your safety and bandwidth.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time synchronization powered by Convex and WebRTC technology.",
  },
  {
    icon: UserCheck,
    title: "Easy Role Assignment",
    description: "Promote trusted users to moderator or regular status with one click.",
  },
  {
    icon: Globe,
    title: "Universal Access",
    description: "Works in any modern browser. No apps, no installations, no hassle.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "Your chatroom is live 24/7. Share your link and connect anytime.",
  },
  {
    icon: Sparkles,
    title: "Clean Interface",
    description: "Discord-inspired layout: userlist left, video center, chat right.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 font-semibold text-sm">Powerful Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for creators, communities, and conversations. Every feature you need to run 
            a successful video chatroom, right out of the box.
          </p>
        </div>

        {/* Main Features - Large Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* All Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-card border border-border hover:border-blue-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
