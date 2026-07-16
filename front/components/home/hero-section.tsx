import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnvPullMark } from "@/components/envpull-mark";
import { SocialLinks } from "@/components/home/social-links";

export function HeroSection() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-5xl flex-col justify-center gap-10 px-6 pb-16 pt-4 md:pb-24">
      <div className="max-w-2xl">
        <Badge
          variant="secondary"
          className="rise mb-5 rounded-full px-3 py-1 font-mono text-[0.7rem] tracking-wide text-jade-deep uppercase"
        >
          zero-knowledge .env sync
        </Badge>
        <h1 className="rise rise-delay-1 flex items-center gap-3 font-display text-5xl leading-[0.95] font-semibold tracking-[-0.04em] text-foreground sm:gap-4 sm:text-6xl md:text-7xl">
          <EnvPullMark
            size={56}
            className="size-12 sm:size-14 md:size-16"
            priority
          />
          envpull
        </h1>
        <p className="rise rise-delay-2 mt-5 max-w-md text-lg leading-relaxed text-ink-soft sm:text-xl">
          Sync environment variables across machines — encrypted locally,
          readable only by you.
        </p>
        <div className="rise rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="h-10 px-5"
            nativeButton={false}
            render={<Link href="#install" />}
          >
            Get started
          </Button>
          <SocialLinks size="icon-lg" variant="outline" />
        </div>
      </div>

      <HeroTerminal />
    </section>
  );
}

function HeroTerminal() {
  return (
    <div className="terminal-in w-full overflow-hidden rounded-2xl border border-border bg-[#15231d] text-[#d7ebe0] shadow-[0_30px_80px_-40px_rgba(20,32,27,0.55)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-white/45">
          ~/projects/app
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[0.85rem] leading-7 sm:text-sm">
        <code>
          <span className="text-white/40">$</span> envpull login{"\n"}
          <span className="text-[#8fd6ad]">✔</span> Logged in successfully
          {"\n"}
          <span className="text-white/40">$</span> envpull init{"\n"}
          <span className="text-[#8fd6ad]">✔</span> Initialized project
          &quot;app&quot;{"\n"}
          <span className="text-white/40">$</span> envpull push{"\n"}
          <span className="text-[#8fd6ad]">✔</span> Uploaded encrypted .env
          {"\n"}
          <span className="text-white/40">$</span>{" "}
          <span className="cursor-blink inline-block h-[1.05em] w-[0.55ch] translate-y-[0.12em] bg-[#8fd6ad] align-baseline" />
        </code>
      </pre>
    </div>
  );
}
