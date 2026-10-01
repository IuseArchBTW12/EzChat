"use client";

import Image from "next/image";
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
        timeline.from(".foyer-glow", { scale: 0.4, opacity: 0, duration: 0.55, ease: "power2.out" })
          .from(".foyer-door-left", { rotateY: -70, opacity: 0, duration: 0.65, ease: "power3.out" }, "<0.05")
          .from(".foyer-door-right", { rotateY: 70, opacity: 0, duration: 0.65, ease: "power3.out" }, "<")
          .from(".foyer-mark", { scale: 0.7, y: 24, opacity: 0, duration: 0.55, ease: "back.out(1.4)" }, "<0.18")
          .from(".foyer-letter", { y: 32, opacity: 0, stagger: 0.06, duration: 0.42, ease: "power3.out" }, "<0.12");
      }, footerRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  return <footer ref={footerRef} className="overflow-hidden border-t border-[#302a26] bg-[#171310] text-[#f6f2ea]"><div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8"><div className="flex min-h-[24rem] flex-col items-center justify-center text-center"><div className="relative mb-8 h-28 w-28 [perspective:700px] sm:h-36 sm:w-36"><div className="foyer-glow absolute inset-[-20%] rounded-full bg-primary/10 blur-xl" /><div className="foyer-door-left absolute inset-y-[16%] left-[16%] w-[34%] origin-right rounded-l-2xl border border-primary/70 bg-primary/20" /><div className="foyer-door-right absolute inset-y-[16%] right-[16%] w-[34%] origin-left rounded-r-2xl border border-primary/70 bg-primary/10" /><Image src="/brand/foyer-door-mark.png" alt="Foyer door mark" fill sizes="144px" className="foyer-mark relative z-10 object-contain" /></div><p className="text-xs font-semibold uppercase tracking-[.26em] text-primary">Come through</p><h2 aria-label="Foyer" className="font-display mt-3 flex overflow-hidden text-6xl font-semibold leading-none tracking-[-.08em] sm:text-8xl">{"FOYER".split("").map((letter, index) => <span key={`${letter}-${index}`} className="foyer-letter inline-block">{letter}</span>)}</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#f6f2ea]/60">A place for live conversation, right before the room begins.</p></div><div className="flex flex-col justify-between gap-6 border-t border-[#f6f2ea]/15 py-7 text-sm text-[#f6f2ea]/60 sm:flex-row sm:items-center"><Brand /><nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2"><Link href="/about" className="hover:text-primary">About</Link><Link href="/how-it-works" className="hover:text-primary">How it works</Link><Link href="/safety" className="hover:text-primary">Safety</Link><Link href="/guidelines" className="hover:text-primary">Guidelines</Link><Link href="/faq" className="hover:text-primary">FAQ</Link></nav><p>© {new Date().getFullYear()} Foyer</p></div></div></footer>;
}
