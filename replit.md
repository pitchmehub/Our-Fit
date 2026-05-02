# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Projects

### OUR FIT — Streetwear AI App
A mobile app (Expo/React Native) for streetwear enthusiasts. Users photograph a clothing item, AI generates 6 Pinterest-inspired outfit suggestions with progressive image loading, likes/favorites, and full-screen detail view.

**Flow:**
1. Google login (Clerk) → gender onboarding → camera screen
2. User photographs or picks a clothing item from gallery
3. AI analyzes piece → returns 6 outfit concepts fast (~5-8s)
4. Skeleton cards appear immediately; AI images generate in parallel and populate cards
5. Tap any card → full-screen detail view with items list, tags, like button
6. "Ver mais looks" → explore screen generates 6 more variations
7. Liked outfits saved to DB and accessible from heart icon in header

**Color palette:** Dark/black (#0A0A0A bg, #E8FF00 neon yellow accent, #111111 cards)

**Navigation:**
- `(auth)/sign-in` → Google OAuth login
- `onboarding` → Gender selection (stored in AsyncStorage)
- `(tabs)/index` → Camera screen (home) with heart + profile buttons in header
- `results` → Progressive outfit grid (skeleton → images)
- `explore` → More outfits like a selected one
- `outfit-detail` → Full-screen photo, items list, like button, other looks strip
- `saved` → Liked outfits grid with pull-to-refresh

### API Server
Express 5 backend with OpenAI integration.

**Endpoints:**
- `POST /api/outfits/analyze` — Analyzes clothing photo (base64), returns 6 outfit concepts (no images) fast
- `POST /api/outfits/generate-image` — Generates one AI image for a concept (gpt-image-1)
- `POST /api/outfits/explore` — Given selected outfit, returns 6 more concepts
- `POST /api/outfits/like` — Save liked outfit to DB
- `DELETE /api/outfits/like/:id` — Unlike outfit
- `GET /api/outfits/liked?userId=` — Get all liked outfits for user

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo (React Native) with expo-router
- **Auth**: Clerk (`@clerk/expo` v3) — Google OAuth; `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (`liked_outfits` table)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **AI**: OpenAI via Replit AI Integrations (gpt-4.1 for vision/chat, gpt-image-1 for images)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Key Files

- `artifacts/our-fit/app/_layout.tsx` — Root layout: Clerk, fonts, ErrorBoundary, FitProvider
- `artifacts/our-fit/app/(tabs)/_layout.tsx` — Auth guard: redirects to sign-in or onboarding
- `artifacts/our-fit/app/(tabs)/index.tsx` — Camera screen with heart+profile header buttons
- `artifacts/our-fit/app/results.tsx` — Progressive outfit grid with skeleton loading
- `artifacts/our-fit/app/explore.tsx` — Explore more outfits
- `artifacts/our-fit/app/outfit-detail.tsx` — Full-screen detail view
- `artifacts/our-fit/app/saved.tsx` — Liked outfits screen
- `artifacts/our-fit/contexts/FitContext.tsx` — Global state (image, outfits, gender, likes)
- `artifacts/our-fit/components/OutfitCard.tsx` — Card with image, gradient, like button, skeleton
- `artifacts/our-fit/lib/api.ts` — API client for all endpoints
- `artifacts/api-server/src/routes/outfits/index.ts` — All outfit routes
- `lib/db/src/schema/liked-outfits.ts` — liked_outfits table schema

## Important Notes

- **Font loading**: Do NOT use `if (!fontsLoaded && !fontError) return null` — this causes a permanent white screen in the Replit/web environment because Google Fonts CDN is slow. Fonts load asynchronously and the app renders fine with system fonts initially.
- **Circular dependency**: `api.ts` uses `import type { Outfit }` from FitContext to avoid runtime circular dependency with FitContext importing api.ts statically.
- Gender stored in AsyncStorage (`our_fit_gender`); liked IDs cached in AsyncStorage (`our_fit_liked_ids`); full liked outfit data in DB.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
