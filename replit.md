# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Projects

### OUR FIT — Streetwear AI App
A mobile app (Expo/React Native) for streetwear enthusiasts. Users photograph a clothing item they own, and the AI builds complete outfit looks inspired by Pinterest trends.

**Flow:**
1. User photographs or picks a clothing item from gallery
2. AI (OpenAI Vision) analyzes the piece (type, color, style)
3. Backend generates 6 streetwear outfit suggestions with AI-generated images
4. User taps any look → 6 more contextually-related options load
5. Infinite exploration: each tap generates 6 new outfit variations

**Color palette:** Dark/black (#0A0A0A background, #E8FF00 neon yellow accent)

### API Server
Express 5 backend with OpenAI integration for outfit analysis and generation.

**Endpoints:**
- `POST /api/outfits/analyze` — Analyzes clothing photo (base64), returns 6 outfit suggestions with AI-generated images
- `POST /api/outfits/explore` — Given selected outfit, returns 6 more variations

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo (React Native) with expo-router
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **AI**: OpenAI via Replit AI Integrations (Vision for analysis, gpt-image-1 for outfit image generation)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Key Files

- `artifacts/our-fit/app/(tabs)/index.tsx` — Camera screen (home)
- `artifacts/our-fit/app/results.tsx` — 6 outfit results grid
- `artifacts/our-fit/app/explore.tsx` — Explore more options (6+6+6...)
- `artifacts/our-fit/contexts/FitContext.tsx` — App state (captured image, outfits, selection)
- `artifacts/our-fit/components/OutfitCard.tsx` — Outfit card with image + gradient overlay
- `artifacts/our-fit/lib/api.ts` — API client for outfit endpoints
- `artifacts/api-server/src/routes/outfits/index.ts` — Outfit analysis + generation routes
- `lib/api-spec/openapi.yaml` — OpenAPI spec (single source of truth)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
