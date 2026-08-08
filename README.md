# TravelAI

AI-style trip planner: enter a destination and get a full day-by-day itinerary — attractions, hidden gems, restaurants, a 3-tier budget breakdown, safety tips, and photography spots. Runs entirely client-side, no API keys, no backend.

## Important: Node version

Your system has **Node 14.17.5**, but this project (Vite 5 + React 18) requires **Node 18 or newer**. `npm install` / `npm run dev` will fail on Node 14.

Install a current Node (e.g. from https://nodejs.org, the LTS build) before running this project. Once Node 18+ is on your PATH:

```bash
npm install
npm run dev       # starts the dev server, prints a local URL
npm run build     # produces a static dist/ folder you can host anywhere
```

## How it works (no external AI API)

- `src/lib/itineraryGenerator.js` — a deterministic, seeded generator that builds the itinerary (days, activities, budget, hidden gems, safety tips) from templates based on your inputs. Same destination + settings always produces the same trip; different inputs vary it. This stands in for the LLM call the original spec used.
- `src/lib/coverImage.js` — resolves a real, theme-matched cover photo via LoremFlickr (no API key needed).
- `src/lib/tripStore.js` — saves generated trips to `localStorage` (stands in for a backend database).

If you'd rather have real AI-generated itineraries (e.g. via Gemini or OpenAI) and AI-generated cover art, swap the body of `generateItinerary()` / `resolveCoverImage()` for real API calls — the rest of the app (all the UI) doesn't need to change.
