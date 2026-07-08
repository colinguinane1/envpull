# envpull

> Secure environment variable management for developers.

⚠️ **Status: Active Development**

envpull is currently in early development and is **not ready for production use yet**. Features, APIs, encryption methods, and workflows may change as development continues.

---

## What is envpull?

envpull is a CLI tool designed to make managing environment variables easier across multiple machines and projects.

Developers constantly deal with `.env` files containing important configuration values:

- API keys
- Database URLs
- OAuth secrets
- Application configuration
- Service credentials

Moving between computers, onboarding team members, or restoring a project setup often means manually copying `.env` files around.

envpull aims to provide a secure way to store, sync, and retrieve environment variables from anywhere using a simple command-line workflow.

---

## Planned Features

### 🔐 Secure secret storage

envpull will encrypt environment variables before storing them, ensuring that sensitive values are protected.

The goal is:

- Secrets are never stored as plain text
- Only authorized users can decrypt their variables
- Projects can safely sync environment configuration

---

### 💻 Simple CLI workflow

The intended workflow will look something like:

```bash
# Authenticate
envpull login

# Create or connect a project
envpull init

# Upload environment variables
envpull push

# Download environment variables
envpull pull
```
