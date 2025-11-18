Overview

This project contains a Vite React client (`client/`) and an Express-based backend (`server/`) that uses WebSockets, sessions, and long-lived connections. Vercel is excellent for static frontends and serverless functions, but it does not support persistent WebSocket servers or long-running processes.

Recommended architecture

- Frontend: Deploy the `client` (built by Vite) to Vercel as a static site.
- Backend: Deploy the `server` (Express + WebSocket) to a service that supports long-lived processes and WebSockets (Render, Fly, DigitalOcean App Platform, AWS EC2/ECS, or Railway). Do NOT try to run the backend as serverless functions on Vercel if you rely on WebSockets or sessions backed by an in-memory store.

What I changed

- `client/src/lib/queryClient.ts`: The client now respects the `VITE_API_BASE` env var. If `VITE_API_BASE` is set, API requests will be sent to that base URL; otherwise, relative paths are used (e.g., `/api/...`). This lets the frontend run on Vercel and talk to your external API.
- `vercel.json`: Sample config that builds the `client` as a static site. It includes a rewrite for `/api/*` to an external backend domain (replace `<YOUR_BACKEND_DOMAIN>`).

How to deploy the frontend to Vercel

1. Create a Vercel project connected to this repository.
2. In Vercel project settings, set the "Framework" to "Other" and the build command to:

   npm run build --prefix client

   and set the output directory to:

   client/dist

   (Alternatively, leave the build command blank if Vercel auto-detects your project; the `vercel.json` file will instruct the build.)

3. Add an environment variable on Vercel:

   - `VITE_API_BASE` = `https://<YOUR_BACKEND_DOMAIN>`

   This tells the client where to find the API. If you want Vercel to proxy `/api/*` to the backend, update the `vercel.json` `routes` entry to point to your backend domain.

4. Deploy. Vercel will run the build and publish the static frontend.

How to deploy the backend (recommended: Render)

Render (example):

- Create a new "Web Service" on Render and connect your repo.
- Set the service to use the `server` directory as the root (or set the start command to `npm run start --prefix .` and build command to `npm run build` from root). Example start command:

  npm run start

- Ensure environment variables are configured: `DATABASE_URL`, `SESSION_SECRET`, `HOST=0.0.0.0`, `PORT=3000`, etc.
- Render will give you a public domain (e.g. `https://my-backend.onrender.com`). Use that domain for `VITE_API_BASE` on Vercel or in `vercel.json` rewrite.

Notes and limitations

- WebSockets: Only deploy the backend to a platform that supports WebSockets (Render, Fly, DigitalOcean App Platform, Railway, etc.). Vercel and many serverless providers do not support persistent WebSocket servers.
- Sessions and in-memory stores: If you use in-memory session stores, they will not persist across multiple instances. Use a persistent store (Postgres, Redis) for sessions in production.

If you'd like, I can:

- Add a small README section to `client/` with exact `npm` commands for local testing and a `vercel` deploy guide.
- Scaffold a `Dockerfile` and `render.yaml` for deploying the backend to Render.
- Create a GitHub Actions workflow to build the client and (optionally) build/push a backend image to a registry.

Tell me which next step you want me to implement (pick one):

- Scaffold `Dockerfile` + `render.yaml` for backend and update README.
- Add `client/README.md` with Vercel-specific build command and local test commands.
- Create GitHub Actions workflow for building and deploying the frontend to Vercel (or backend to a registry).

