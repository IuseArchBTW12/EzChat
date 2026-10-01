import { MessageCircle, ShieldCheck, Video } from "lucide-react";

const features = [
  [Video, "See the room", "Turn on your camera, join a stream, or share your screen when the moment calls for it."],
  [MessageCircle, "Keep the thread moving", "Video and text sit together, so nobody is left behind when they need to type instead."],
  [ShieldCheck, "Host with intent", "Owners can manage roles, remove messages, ban accounts, and filter words for their own room."],
] as const;

export function Features() {
  return <section id="features" className="border-b border-border py-20 sm:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Made for being there</p><h2 className="font-display mt-5 text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">A room, not another feed.</h2></div><div className="divide-y divide-border border-y border-border">{features.map(([Icon, title, copy], index) => <article key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-7 sm:grid-cols-[4rem_1fr_1.3fr] sm:gap-6"><span className="font-display pt-1 text-sm text-primary">0{index + 1}</span><h3 className="font-display text-2xl font-semibold tracking-[-0.035em]">{title}</h3><p className="col-span-2 text-sm leading-6 text-muted-foreground sm:col-span-1"><Icon className="mr-2 inline h-4 w-4 text-primary" />{copy}</p></article>)}</div></div></div></section>;
}
