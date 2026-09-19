# QRForge

Create, preview, download, and scan QR codes in the browser.

[qrforge-sigma.vercel.app](https://qrforge-sigma.vercel.app)

Paste a URL, Wi-Fi network, vCard, email, SMS, phone number, or location. The preview **is** the file — PNG, SVG, or JPEG — with a real quiet zone and no watermark on the image. Scan with the camera or a photo. Guests keep everything on this device. Sign in only if you want a library that follows you across devices.

## Features

- **Create** — website, text, Wi-Fi, contact card, email, SMS, phone, geo
- **Download** — PNG, SVG, JPEG. What you see is what prints
- **Scan** — camera or uploaded photo, decoded in the browser
- **Library** — save on this device as a guest, or sign in for an account library
- **Logo** — optional center mark, blocked at error-correction L so scans still work

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:8080`).

## Host on Vercel

1. Import this repo in [Vercel](https://vercel.com/new).
2. Build command: `npm run build` (already in `package.json`).
3. Framework preset: **Other**. Leave output directory blank.
4. Create a [Neon](https://neon.tech) Postgres database only if you want accounts and a cloud library. Guest create / scan / download work without it.
5. Add these environment variables if you enable sign-in:

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `BETTER_AUTH_URL` | Public site URL, e.g. `https://qrforge-sigma.vercel.app` |
| `BETTER_AUTH_SECRET` | Long random secret |
| `VITE_AUTH_ENABLED` | `true` |

6. Deploy. If you add a custom domain, set `BETTER_AUTH_URL` to that domain and redeploy.

## Stack

TanStack Start, Vite, Tailwind, Better Auth, Neon Postgres (PGLite locally).
