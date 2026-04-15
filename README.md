# Battleship

Frontend-only Battleship game built with React and Vite.

This project is ready to deploy on Cloudflare Pages without any backend service or Cloudflare Worker.

## Project Structure

- `battleship-frontend/`: React application (game, AI opponent, settings, leaderboard)

## Frontend-Only Architecture

The game runs entirely in the browser:

- Game logic and AI are client-side JavaScript.
- Leaderboard and settings are stored in browser `localStorage`.
- No API calls are required to play.

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
