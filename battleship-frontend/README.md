# Battleship Frontend

React + Vite frontend for the Battleship game.

## Runtime Model

This app is fully frontend-only:

- No backend server required
- No Cloudflare Worker required
- All game state, settings, and leaderboard data are stored in browser `localStorage`

## Local Development

```bash
npm install
npm run dev
```

Open the dev URL printed by Vite.

## Production Build

```bash
npm run build
npm run preview
```

## Cloudflare Pages Deployment

Use these settings when creating a Pages project from this repository:

- Root directory (Path): `battleship-frontend`
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

SPA routing fallback is configured via `public/_redirects`.

## Notes

- Leaderboard entries are per-browser and per-device.
- Clearing browser data clears stored leaderboard/settings.
