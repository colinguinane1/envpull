import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InstallCommand } from "@/components/install-command";
import { GitHubIcon, NpmIcon } from "@/components/brand-icons";
import { EnvPullMark } from "@/components/envpull-mark";

const PRINCIPLES = [
  {
    title: "Your secrets are yours.",
    body: "envpull encrypts .env files on your machine before upload. The server only stores ciphertext — we never see your plaintext secrets.",
  },
  {
    title: "Your workflow stays simple.",
    body: "login, init, push, pull. The same commands on every machine, with the same recovery key if you forget your password.",
  },
  {
    title: "Your files stay open.",
    body: "Plain .env files on disk. No proprietary vault format locking you in — just encrypted sync for what you already use.",
  },
] as const;

const STEPS = [
  { cmd: "envpull login", note: "Create an account or sign in" },
  { cmd: "envpull init", note: "Link this project" },
  { cmd: "envpull push", note: "Encrypt and upload .env" },
  { cmd: "envpull pull", note: "Download and decrypt elsewhere" },
] as const;

export default function Home() {
  return (
    <div className="site-bg min-h-full">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-foreground"
        >
          <EnvPullMark size={28} priority />
          envpull
        </Link>
        <nav className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="GitHub repository"
            render={
              <a
                href="https://github.com/colinguinane1/envpull"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <GitHubIcon className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="npm package"
            render={
              <a
                href="https://www.npmjs.com/package/@colinguinane/envpull-cli"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <NpmIcon className="size-5" />
          </Button>
        </nav>
      </header>

      <main>
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
              <Button
                size="icon-lg"
                variant="outline"
                nativeButton={false}
                aria-label="GitHub repository"
                render={
                  <a
                    href="https://github.com/colinguinane1/envpull"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <GitHubIcon className="size-5" />
              </Button>
              <Button
                size="icon-lg"
                variant="outline"
                nativeButton={false}
                aria-label="npm package"
                render={
                  <a
                    href="https://www.npmjs.com/package/@colinguinane/envpull-cli"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <NpmIcon className="size-5" />
              </Button>
            </div>
          </div>

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
        </section>

        <Separator className="mx-auto max-w-5xl" />

        <section className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-20 md:grid-cols-3 md:gap-10">
          {PRINCIPLES.map((item) => (
            <div key={item.title} className="max-w-sm">
              <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <Separator className="mx-auto max-w-5xl" />

        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Four commands.
          </h2>
          <p className="mt-3 max-w-lg text-ink-soft">
            Encrypted before it leaves your machine. Decrypted only with your
            password or recovery key.
          </p>
          <ol className="mt-10 divide-y divide-border border-y border-border">
            {STEPS.map((step, index) => (
              <li
                key={step.cmd}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-mist">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <code className="font-mono text-base text-foreground sm:text-lg">
                    {step.cmd}
                  </code>
                </div>
                <span className="pl-8 text-sm text-ink-soft sm:pl-0 sm:text-right">
                  {step.note}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <Separator className="mx-auto max-w-5xl" />

        <section
          id="install"
          className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-20"
        >
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Install
            </h2>
            <p className="mt-3 max-w-lg text-ink-soft">
              Requires Node 20+. Point the CLI at{" "}
              <code className="font-mono text-sm text-foreground">
                api.envpull.dev
              </code>{" "}
              by default — or your own host.
            </p>
          </div>
          <InstallCommand />
          <p className="font-mono text-sm text-ink-soft">
            Then run <span className="text-foreground">envpull login</span>
          </p>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-col gap-4 border-t border-border px-6 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <EnvPullMark size={22} />
          envpull
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="GitHub repository"
            render={
              <a
                href="https://github.com/colinguinane1/envpull"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <GitHubIcon className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="npm package"
            render={
              <a
                href="https://www.npmjs.com/package/@colinguinane/envpull-cli"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <NpmIcon className="size-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
