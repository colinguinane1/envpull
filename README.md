# envpull

Secure, client-side encrypted `.env` sync for developers.

Website: [https://envpull.dev](https://envpull.dev) · API: [https://api.envpull.dev](https://api.envpull.dev)

## Install

```bash
npm i -g @colinguinane/envpull-cli
```

Requires Node.js 20+.

## Quick start

```bash
envpull login          # create an account or sign in
envpull init           # link this directory to a project
envpull push           # encrypt and upload .env
envpull pull           # download and decrypt .env
```

Forgot your password?

```bash
envpull recover        # reset with your recovery key (no login required)
```

## How encryption works

- Your `.env` is encrypted on your machine (AES-GCM) before upload.
- The server stores ciphertext and key wraps only — not plaintext secrets.
- Unlock uses your password locally (Argon2id). On signup you get a **recovery key**; save it. envpull cannot restore a vault if both the password and recovery key are lost.
- Password and recovery key are sent over TLS so the API can authenticate you (they're hashed server-side). Env contents stay client-encrypted.

## Useful commands

```bash
envpull whoami
envpull logout
envpull config show
envpull config set-api https://api.envpull.dev
envpull config set-biometrics on   # macOS Touch ID unlock
```

Override the API URL with `ENVPULL_API_URL` (HTTPS required; `http://localhost` allowed for local dev).

## Self-host

See [docs/self-host.md](docs/self-host.md).

## License

ISC
