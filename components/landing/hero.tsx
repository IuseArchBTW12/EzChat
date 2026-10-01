"use client";

import { SignInButton } from "@clerk/nextjs";
import { ArrowDownRight, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 signal-field opacity-70" />
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-end gap-12 px-4 pb-14 pt-24 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:pb-20">
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
            EzChat is a place for live conversation: video on, chat moving, and a room that belongs to its community.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <SignInButton mode="modal">
              <Button size="lg" className="h-13 rounded-full px-7 text-base font-semibold">
                Enter EzChat <ArrowDownRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
            <button type="button" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="h-13 rounded-full border border-border px-7 text-left text-sm font-semibold transition-colors hover:bg-secondary">
              See how rooms work
            </button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md pb-2 lg:pb-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-[0_20px_80px_hsl(var(--foreground)/0.12)]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">On air</p><p className="font-display mt-1 text-xl font-semibold tracking-tight">The room is open</p></div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Video className="h-4 w-4" aria-hidden="true" /></span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3" aria-hidden="true">
              <div className="aspect-[4/3] rounded-2xl bg-[linear-gradient(135deg,hsl(var(--secondary))_0%,hsl(var(--accent))_100%)]" />
              <div className="aspect-[4/3] rounded-2xl bg-[radial-gradient(circle_at_70%_25%,hsl(var(--primary)/.75)_0%,transparent_32%),hsl(var(--secondary))]" />
              <div className="aspect-[4/3] rounded-2xl bg-[linear-gradient(45deg,hsl(var(--accent))_0%,hsl(var(--secondary))_65%)]" />
              <div className="flex aspect-[4/3] items-end rounded-2xl bg-foreground p-3 text-background"><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Your turn</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-medium text-muted-foreground"><span>CAM + CHAT</span><span className="text-primary">LIVE</span></div>
          </div>
          <p className="mt-4 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Built for the conversation, not the feed</p>
        </div>
      </div>
    </section>
  );
}
