import { InstallCommand } from "@/components/install-command";

export function InstallSection() {
  return (
    <section
      id="install"
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-20"
    >
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Install
        </h2>
        <p className="mt-3 max-w-lg text-ink-soft">
          Requires Node 20+. The CLI uses {" "}
          <code className="font-mono text-sm text-foreground">
            api.envpull.dev
          </code>{" "}
          by default — or you can host yourself.
        </p>
      </div>
      <InstallCommand />
      <p className="font-mono text-sm text-ink-soft">
        Then run <span className="text-foreground">envpull login</span>
      </p>
    </section>
  );
}
