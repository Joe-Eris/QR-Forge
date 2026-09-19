# QRForge

Static QR codes in the browser. A product of **Eris — Evolving Innovation**.

Create, preview, download, and scan QR codes without an account. Sign in only if you want a library that follows you across devices.

**Live:** [qrforge-sigma.vercel.app](https://qrforge-sigma.vercel.app)

## What it does

- **Create** — URL, text, Wi-Fi, vCard, email, SMS, phone, geo
- **Download** — PNG, SVG, JPEG. Preview is the file. No watermark on the image
- **Scan** — camera or photo, in the browser
- **Library** — save on this device as a guest, or sign in to keep codes in your account

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:8080`).

## Host on Vercel

1. Import this repo in [Vercel](https://vercel.com/new).
2. Build command: `npm run build` (already in `package.json`).
3. Create a [Neon](https://neon.tech) Postgres database for accounts and the saved library. Guest create / scan / download work without it.
4. Add these environment variables in the Vercel project:

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `BETTER_AUTH_URL` | Public site URL, e.g. `https://your-app.vercel.app` |
| `BETTER_AUTH_SECRET` | Long random secret |
| `VITE_AUTH_ENABLED` | `true` |

5. Deploy. If you add a custom domain, set `BETTER_AUTH_URL` to that domain and redeploy.

Email/password sign-in works with those variables. Guest generation never needs an account.

## Stack

TanStack Start, Vite, Tailwind, Better Auth, Neon Postgres (PGLite in local preview).
