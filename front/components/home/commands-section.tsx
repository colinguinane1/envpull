const STEPS = [
  { cmd: "envpull login", note: "Create an account or sign in" },
  { cmd: "envpull init", note: "Link this project" },
  { cmd: "envpull push", note: "Encrypt and upload .env" },
  { cmd: "envpull pull", note: "Download and decrypt elsewhere" },
] as const;

export function CommandsSection() {
  return (
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
  );
}
