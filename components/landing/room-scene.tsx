import Image from "next/image";

const moments = [
  ["Arrive", "Browse rooms that are already moving. Drop in without having to stage-manage a whole event."],
  ["Be present", "Use camera, text, voice controls, or screen share. Take part in the way that feels natural."],
  ["Keep it yours", "Every room has an owner, clear roles, and moderation tools that stay with the community."],
] as const;

export function RoomScene() {
  return <section className="border-b border-border py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"><div className="lg:sticky lg:top-24 lg:h-fit"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">Human, after dark</p><h2 className="font-display mt-5 max-w-lg text-4xl font-semibold leading-none tracking-[-.055em] sm:text-5xl">More faces. Less performance.</h2><div className="relative mt-9 aspect-[4/3] overflow-hidden rounded-[2rem] bg-foreground"><Image src="/images/ezchat-night-room.png" alt="Friends gathered in a living room talking with a friend on video" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent" /></div><div className="relative -mt-16 ml-auto mr-5 w-2/5 overflow-hidden rounded-2xl border-4 border-background shadow-xl"><Image src="/images/ezchat-couch-call.png" alt="Two friends reacting to a laptop stream" width={1536} height={1024} className="aspect-[4/3] object-cover" /></div></div><div className="flex min-h-[33rem] flex-col justify-center divide-y divide-border border-y border-border">{moments.map(([title, copy], index) => <article key={title} className="py-9 first:pt-0 last:pb-0"><p className="text-xs font-bold tracking-[.2em] text-primary">0{index + 1}</p><h3 className="font-display mt-4 text-3xl font-semibold tracking-[-.04em]">{title}</h3><p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">{copy}</p></article>)}</div></div></section>;
}
