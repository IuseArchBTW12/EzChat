"use client";

import { SignInButton } from "@clerk/nextjs";
import { ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return <section className="bg-foreground py-20 text-background sm:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Your room is waiting</p><div className="mt-6 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"><h2 className="font-display max-w-3xl text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Start where the conversation is.</h2><SignInButton mode="modal"><Button size="lg" className="h-13 shrink-0 rounded-full px-7 text-base font-semibold">Claim your room <ArrowDownRight className="ml-2 h-5 w-5" /></Button></SignInButton></div></div></section>;
}
