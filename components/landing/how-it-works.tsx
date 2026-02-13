"use client";

import { useEffect, useRef } from "react";
import { UserPlus, Video, Users, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Claim Your Username",
    description:
      "Pick a unique all-caps username. That's your chatroom! For example: QNAM, TECHTALKS, or GAMING.",
    color: "blue",
  },
  {
    number: "02",
    icon: Video,
    title: "Share Your Link",
    description:
      "Your chatroom is instantly live at ezchat.cam/YOURNAME. Share it with friends, community, or the world.",
    color: "purple",
  },
  {
    number: "03",
    icon: Users,
    title: "Manage Your Community",
    description:
      "Set roles, assign moderators, and control who can chat. You're in complete control of your space.",
    color: "green",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Connect & Grow",
    description:
      "Build your community with video chat, text messaging, and powerful moderation tools.",
    color: "amber",
  },
];

const colorMap = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
  },
  amber: {
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-200",
  },
};

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        x: -100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Animate connector lines
      gsap.from(".connector-line", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        scaleX: 0,
        duration: 0.6,
        stagger: 0.2,
        delay: 0.3,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get your chatroom up and running in minutes
          </p>
        </div>

        <div className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colors = colorMap[step.color as keyof typeof colorMap];

            return (
              <div key={index} className="relative">
                <div className="step-item flex flex-col md:flex-row items-center gap-8 mb-12">
                  {/* Number & Icon */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-100">
                      <span className={`font-bold ${colors.text}`}>
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-12 top-24 w-0.5 h-12 bg-gradient-to-b from-border to-transparent connector-line origin-top" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
