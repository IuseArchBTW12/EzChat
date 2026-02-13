"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "4x3 video grid (12 cams)",
      "360p video quality",
      "Text chat access",
      "Basic moderation tools",
      "Unlimited chatroom visits",
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-gray-500 to-gray-600",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For active community builders",
    features: [
      "5x4 video grid (20 cams)",
      "360p video quality",
      "Direct messaging (coming soon)",
      "Advanced moderation",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    gradient: "from-green-500 to-emerald-600",
    badge: "Most Popular",
  },
  {
    name: "Extreme",
    price: "$19.99",
    period: "/month",
    description: "Maximum features & control",
    features: [
      "5x4 video grid (20 cams)",
      "360p video quality",
      "Direct messaging (coming soon)",
      "Premium moderation tools",
      "24/7 priority support",
    ],
    cta: "Go Extreme",
    popular: false,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Gold",
    price: "$29.99",
    period: "/month",
    description: "Ultimate chatroom experience",
    features: [
      "5x4 video grid (20 cams)",
      "360p video quality",
      "Direct messaging (coming soon)",
      "Gold badge & priority listing",
      "Dedicated support",
    ],
    cta: "Get Gold",
    popular: false,
    gradient: "from-yellow-500 to-amber-600",
  },
];

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pricing-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your community. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`pricing-card relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 ${
                tier.popular
                  ? "border-green-500 scale-105 lg:scale-110"
                  : "border-gray-100 hover:border-blue-200"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {tier.badge}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-gray-600">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white`}
                size="lg"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
