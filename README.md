# Algreenia

Where every tree tells a story. Algreenia helps communities across Algeria plant, water and measure trees.

Built with Next.js, TypeScript, GSAP, Lenis and three.js. There is no backend yet: app state lives in the browser, and sample content lives in `src/lib/data.ts`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things are

| Path | What it holds |
| --- | --- |
| `src/world/` | The WebGL world: terrain, procedural trees, rain, fireflies |
| `src/world/keys.ts` | The scroll story as data. Edit this to change camera, light and greening per chapter |
| `src/components/home/` | Home page stage and scroll choreography |
| `src/components/pages/` | Interactive parts of each feature page |
| `src/lib/store.ts` | Local state that stands in for the backend. Replace these calls when the API exists |
| `src/styles/` | Design tokens, home chapters, feature pages |

## Status

- Tree identification and the assistant are marked as coming soon.
- Login, campaigns, irrigation logs and the profile are simulated in `localStorage`. Passwords are never stored.
- Weather on the irrigation page is live from Open-Meteo, which needs no API key.
- Campaign, impact and contributor numbers are sample data.

## Accessibility

Animation respects `prefers-reduced-motion`, and the footer has a control to pause it. Without animation or WebGL, every chapter still renders with static art.
