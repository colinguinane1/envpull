# Publish (requires 2FA OTP)

The package will **not** be installable unless publish completes with a one-time password.

```bash
cd cli
pnpm test && pnpm build

# Replace 123456 with the code from your authenticator app
npm publish --access public --otp=123456
```

You must see:

```
+ @colinguinane/envpull-cli@0.1.2
```

**Verify before installing:**

```bash
npm view @colinguinane/envpull-cli version
# must print: 0.1.2
# if 404, publish did not succeed
```

Then:

```bash
pnpm add -g @colinguinane/envpull-cli
envpull --version
```

## Why install was 404

1. Earlier publishes looked like they succeeded (HTTP 200) but without a valid OTP the package never became available on the registry.
2. Installing before `npm view` returns a version will always 404.
