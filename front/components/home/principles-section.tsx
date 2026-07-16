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

export function PrinciplesSection() {
  return (
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
  );
}
