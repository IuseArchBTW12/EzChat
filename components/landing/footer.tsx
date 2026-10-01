"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brand } from "@/components/brand";

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const timeline = gsap.timeline({ scrollTrigger: { trigger: footerRef.current, start: "top 76%", once: true } });
        timeline.from(".foyer-mark", { scale: 0.7, y: 24, opacity: 0, duration: 0.55, ease: "back.out(1.4)" })
          .from(".foyer-letter", { y: 32, opacity: 0, stagger: 0.06, duration: 0.42, ease: "power3.out" }, "<0.12");
      }, footerRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  return <footer ref={footerRef} className="overflow-hidden border-t border-white/15 bg-black text-[#f6f2ea]"><div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8"><div className="flex min-h-[24rem] flex-col items-center justify-center text-center"><div className="relative mb-2 h-64 w-64 sm:h-80 sm:w-80"><video autoPlay loop muted playsInline preload="auto" poster="/brand/foyer-door-mark.png" aria-hidden="true" className="foyer-mark relative z-10 h-full w-full object-contain"><source src="/brand/foyer-logo-reveal.mp4" type="video/mp4" /></video></div><p className="text-xs font-semibold uppercase tracking-[.26em] text-primary">Come through</p><h2 aria-label="Foyer" className="font-display mt-3 flex overflow-hidden text-6xl font-semibold leading-none tracking-[-.08em] sm:text-8xl">{"FOYER".split("").map((letter, index) => <span key={`${letter}-${index}`} className="foyer-letter inline-block">{letter}</span>)}</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#f6f2ea]/60">A place for live conversation, right before the room begins.</p></div><div className="flex flex-col justify-between gap-6 border-t border-[#f6f2ea]/15 py-7 text-sm text-[#f6f2ea]/60 sm:flex-row sm:items-center"><Brand /><nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2"><Link href="/about" className="hover:text-primary">About</Link><Link href="/how-it-works" className="hover:text-primary">How it works</Link><Link href="/safety" className="hover:text-primary">Safety</Link><Link href="/guidelines" className="hover:text-primary">Guidelines</Link><Link href="/faq" className="hover:text-primary">FAQ</Link></nav><p>© {new Date().getFullYear()} Foyer</p></div></div></footer>;
}
