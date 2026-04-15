# Battleship Frontend

React + Vite frontend for the Battleship game.

## Runtime Model

This app uses Cloudflare-native persistence for leaderboard data:

- React frontend hosted on Cloudflare Pages
- Leaderboard API implemented with Cloudflare Pages Functions
- Leaderboard storage in Cloudflare D1

## D1 Setup

1. Create a D1 database:

```bash
npx wrangler d1 create battleship-leaderboard
```

2. Copy the returned `database_id` into [wrangler.toml](wrangler.toml#L7).

3. Apply migrations:

```bash
npx wrangler d1 migrations apply battleship-leaderboard --remote
```

4. In Cloudflare Pages project settings, add a D1 binding:

- Variable name: `DB`
- Database: `battleship-leaderboard`

## Leaderboard API

Pages Functions endpoints:

- `GET /api/leaderboard` returns top entries
- `POST /api/leaderboard` creates a new entry
- `DELETE /api/leaderboard/:id` deletes an entry (dev mode action)

If the D1-backed API is unavailable, the frontend automatically attempts a localhost fallback at `http://localhost:8788/api/leaderboard` and shows a status message in the leaderboard panel.

## Local Development

Use Vite for UI development:

```bash
npm install
npm run dev
```

To test Functions + D1 locally, build and run with Wrangler:

```bash
npm run build
npx wrangler pages dev dist
```


Open the URL printed by the command you run.

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

- Leaderboard entries are shared across users through D1.
- Game settings (theme, difficulty, board size, dev mode) still use browser localStorage.
