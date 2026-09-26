# ADHD Predict architecture

This directory is the implementation guide for the adult self-report questionnaire. Start with [the project plan](./project-plan.md), then use [the architecture](./architecture.md) for module boundaries and deployment behavior. Existing operational notes remain in [best-practices](./best-practices/).

## Current baseline (develop, 2026-09-26)

- Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Zod 4 and Biome.
- The home page is still the starter page. There is no questionnaire UI, scoring implementation, persistence, test suite or application API yet.
- `data/adhd-questions.json` is a versioned 20-question adult bank; `lib/schemas/adhd-questions.ts` validates its structure and `lib/server/adhd-questions.ts` parses it once on the server.
- [The scoring guide](../data/SCORING.md) defines the current counts, context checks and restrained result language. Treat it and the JSON rubric as the product's current contract; resolve discrepancies before implementing scoring.
- `develop` has Vinext, the Cloudflare Vite plugin, Wrangler configuration and build/preview scripts. The README and preview guide describe `main` as production and non-production branches as previews. These are repository settings and instructions, not verification of the live Cloudflare dashboard.

## Document ownership

| Document | Maintained when |
| --- | --- |
| [Project plan](./project-plan.md) | Scope, milestones, acceptance criteria or rollout changes |
| [Architecture](./architecture.md) | Data flow, boundaries, contracts, storage or deployment changes |
| [Scoring guide](../data/SCORING.md) | Clinical wording or algorithm rules change, with review and fixtures |
| [Cloudflare previews](./best-practices/enable-cloudfare-previews.md) | Build, Wrangler or dashboard integration changes |
| [Server Actions](./best-practices/next-server-actions.md) | Mutation conventions change |

Update documentation in the same PR as the behavior it describes. Record a short decision in the relevant PR when deviating from this architecture.
