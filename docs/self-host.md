# Self-hosting envpull API

## Requirements

- Node 20+
- PostgreSQL
- pnpm

## Backend

```bash
cd back
cp .env.example .env   # or create .env
# set DATABASE_URL and JWT_SECRET (long random string)
pnpm install
pnpm exec prisma migrate deploy
pnpm db:generate
pnpm dev
# or: PORT=3000 HOST=0.0.0.0 pnpm exec tsx src/index.ts
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `JWT_SECRET` | yes | HS256 signing secret (min 32 characters) |
| `PORT` | no | Default `3000` |
| `HOST` | no | Default `0.0.0.0` |

Put the API behind HTTPS (Caddy, nginx, Fly, Railway, etc.).

## CLI

By default the CLI talks to `https://api.envpull.dev`.

Override when needed:

```bash
# temporary / shell
export ENVPULL_API_URL=http://localhost:3000

# saved self-hosted override
envpull config set-api https://your-api.example.com
# or
export ENVPULL_API_URL=https://api.example.com
```

Check:

```bash
envpull config show
```

Resolution order: `ENVPULL_API_URL` → `~/.envpull/config.json` → `https://api.envpull.dev`.

Then:

```bash
envpull login
envpull init
envpull push
envpull pull
```

## Recovery

If you forget your password:

```bash
envpull recover
```

You need your email and the recovery key shown at signup. No prior login required.

## Notes

- The server never sees plaintext `.env` contents or the master key.
- While logged in, the vault master key is stored in the macOS Keychain when available (otherwise `~/.envpull/unlocked.key`).
- On Mac, enable Touch ID for unlock prompts:

```bash
envpull config set-biometrics on
```

  After the next password unlock (or immediately if already unlocked), `push`/`pull` will ask for Touch ID instead of your password. This is device-local — account password / recovery key are still required on a new machine.
- Logout clears the session JWT and the unlock key.
