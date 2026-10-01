"use client";

import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { ArrowDownRight, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = heroRef.current;
      if (!hero) return;
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-hero.getBoundingClientRect().top / travel, 0), 1);
      const scene = sceneRef.current;
      scene?.style.setProperty("--hero-far", `${-46 * progress}px`);
      scene?.style.setProperty("--hero-mid", `${-94 * progress}px`);
      scene?.style.setProperty("--hero-near", `${-142 * progress}px`);
      scene?.style.setProperty("--hero-scale", String(1 + progress * 0.08));
      scene?.style.setProperty("--hero-door", `${progress * 38}px`);
      scene?.style.setProperty("--hero-copy", String(Math.max(0.28, 1 - progress * 0.72)));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={heroRef} className="relative isolate h-[165svh] overflow-hidden border-b border-border bg-background">
      <div className="pointer-events-none absolute inset-0 signal-field opacity-80" />
      <div className="relative top-16 mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-end gap-12 px-4 pb-14 pt-24 sm:sticky sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-20">
        <div className="relative z-20 max-w-3xl">
          <p className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"><Radio className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Rooms, not feeds.</p>
          <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[0.93] tracking-[-0.07em] text-foreground sm:text-7xl lg:text-8xl">Come in.<span className="block text-primary">Find your people.</span></h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">Foyer is live conversation with a front door. Open a room, turn on your camera, and let your community make it theirs.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><SignInButton mode="modal"><Button size="lg" className="h-13 rounded-full px-7 text-base font-semibold">Enter Foyer <ArrowDownRight className="ml-2 h-5 w-5" /></Button></SignInButton><button type="button" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="h-13 rounded-full border border-border bg-background/75 px-7 text-left text-sm font-semibold transition-colors hover:bg-secondary">See how rooms work</button></div>
        </div>
        <div ref={sceneRef} className="hero-scene relative mx-auto w-full max-w-xl pb-2 lg:pb-8">
          <div className="hero-arch hero-far absolute -right-3 -top-14 h-[28rem] w-[86%] rounded-t-[9rem] border border-border bg-secondary sm:h-[34rem]" />
          <div className="hero-back hero-mid absolute right-0 top-0 aspect-[4/5] w-[88%] overflow-hidden rounded-t-[7.5rem] border border-foreground/15 bg-foreground"><Image src="/images/ezchat-kitchen-call.png" alt="Friends enjoying a video conversation at a kitchen table" fill sizes="(min-width: 1024px) 440px, 86vw" priority className="object-cover opacity-90" /><div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 to-transparent" /></div>
          <div className="hero-door-edge hero-near absolute bottom-8 right-[12%] z-10 h-[74%] w-8 rounded-t-full bg-primary" aria-hidden="true" />
          <div className="hero-room-card hero-near relative z-20 mt-32 overflow-hidden rounded-[2rem] border border-border bg-card/95 p-5 shadow-[0_24px_70px_hsl(var(--foreground)/0.16)] backdrop-blur-sm"><div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Live room</p><p className="font-display mt-1 text-xl font-semibold tracking-tight">The door is open</p></div><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Video className="h-4 w-4" aria-hidden="true" /></span></div><div className="mt-5 overflow-hidden rounded-2xl bg-secondary"><Image src="/images/ezchat-night-room.png" alt="Friends gathered for a live video chat" width={1536} height={1024} className="aspect-[16/9] w-full object-cover" /></div><div className="mt-5 flex items-center justify-between text-xs font-medium text-muted-foreground"><span>CAM + CHAT</span><span className="text-primary">OPEN NOW</span></div></div>
          <div className="hero-brand-mark hero-far absolute -bottom-1 left-2 z-30 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-background shadow-[10px_10px_0_hsl(var(--primary))] sm:h-24 sm:w-24" aria-hidden="true"><Image src="/brand/foyer-door-mark.png" alt="" width={56} height={56} className="h-12 w-12 object-contain sm:h-14 sm:w-14" /></div>
          <p className="hero-copy mt-5 text-right text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Every room starts with an invitation</p>
        </div>
      </div>
    </section>
  );
}
