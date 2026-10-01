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
      const travel = hero.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(-hero.getBoundingClientRect().top / travel, 0), 1);
      sceneRef.current?.style.setProperty("--hero-far", `${-120 * progress}px`);
      sceneRef.current?.style.setProperty("--hero-near", `${-52 * progress}px`);
      sceneRef.current?.style.setProperty("--hero-scale", String(1 + progress * 0.1));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={heroRef} className="relative isolate h-[155svh] overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 signal-field opacity-70" />
      <div className="relative top-16 mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-end gap-12 px-4 pb-14 pt-24 sm:sticky sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:pb-20">
        <div className="max-w-3xl">
          <p className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Radio className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Drop in. Stay awhile.
          </p>
          <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[0.93] tracking-[-0.07em] text-foreground sm:text-7xl lg:text-8xl">
            Make a room.
            <span className="block text-primary">Find your people.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Foyer is a place for live conversation: video on, chat moving, and a room that belongs to its community.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <SignInButton mode="modal">
              <Button size="lg" className="h-13 rounded-full px-7 text-base font-semibold">
                Enter Foyer <ArrowDownRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
            <button type="button" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="h-13 rounded-full border border-border px-7 text-left text-sm font-semibold transition-colors hover:bg-secondary">
              See how rooms work
            </button>
          </div>
        </div>
        <div ref={sceneRef} className="hero-scene relative mx-auto w-full max-w-md pb-2 lg:pb-8">
          <div className="absolute -right-8 -top-10 aspect-[4/5] w-[88%] overflow-hidden rounded-[2rem] border border-border/70 bg-foreground shadow-[0_24px_80px_hsl(var(--foreground)/0.22)]">
            <Image src="/images/ezchat-kitchen-call.png" alt="Friends enjoying a video conversation at a kitchen table" fill sizes="(min-width: 1024px) 380px, 85vw" priority className="object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
          </div>
          <div className="hero-room-card relative mt-24 overflow-hidden rounded-[2rem] border border-border bg-card/95 p-5 shadow-[0_20px_80px_hsl(var(--foreground)/0.16)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">On air</p><p className="font-display mt-1 text-xl font-semibold tracking-tight">The room is open</p></div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Video className="h-4 w-4" aria-hidden="true" /></span>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl bg-secondary">
              <Image src="/images/ezchat-night-room.png" alt="Friends gathered for a live video chat" width={1536} height={1024} className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-medium text-muted-foreground"><span>CAM + CHAT</span><span className="text-primary">LIVE</span></div>
          </div>
          <p className="mt-4 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Built for the conversation, not the feed</p>
        </div>
      </div>
    </section>
  );
}
