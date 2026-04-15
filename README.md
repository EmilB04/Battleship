# Battleship

Battleship game built with React and Cloudflare Pages Functions.

This project is ready to deploy entirely on Cloudflare (Pages + D1).

## Project Structure

- `battleship-frontend/`: React application (game, AI opponent, settings, leaderboard)

## Cloudflare Architecture

The game uses Cloudflare-native components:

- Game logic and AI are client-side JavaScript.
- Leaderboard is served through `/api/leaderboard` Pages Functions.
- Leaderboard data is persisted in Cloudflare D1.
- User settings are stored in browser `localStorage`.

## Run Locally

```bash
cd battleship-frontend
npm install
npm run dev
```

## Deploy To Cloudflare Pages

Use the `battleship-frontend` directory as the Pages project root.

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory (Path): `battleship-frontend`

This repository includes an SPA fallback file so direct URL refreshes work on Pages.
