import { Video } from "lucide-react";

export function Footer() {
  return <footer className="border-t border-border py-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><div className="flex items-center gap-2 font-display font-semibold text-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Video className="h-3.5 w-3.5" /></span> EZCHAT</div><p>© {new Date().getFullYear()} EzChat. Built for live conversation.</p></div></footer>;
}
