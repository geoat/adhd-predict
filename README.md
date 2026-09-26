# ADHD Prediction

Next.js application deployed to Cloudflare Workers with [Vinext](https://github.com/cloudflare/vinext).

## Setup

Requires Node.js 20+.

```bash
npm ci
```

## Local development

Use Next.js for standard browser development:

```bash
npm run dev
```

Use Vinext to exercise the Cloudflare Worker runtime, Server Actions, and asset handling:

```bash
npm run dev:vinext
```

## Build and deploy

The production build must use Vinext:

```bash
npm run build
```

It generates the Worker in `dist/server/index.js`, its Wrangler configuration in `dist/server/wrangler.json`, and client assets in `dist/client`.

Deploy or preview the generated Worker:

```bash
npm run deploy
npm run preview
```

For a manual preview:

```bash
npm run build:vinext
npx wrangler preview --config dist/server/wrangler.json
```

Do not enable Next.js `output: "export"`; Server Actions and other server-side features require the Worker runtime.

## Cloudflare Workers Builds

Configure the connected repository with:

- Production branch: `main`
- Preview Builds: enabled
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy --config dist/server/wrangler.json`
- Preview command: `npx wrangler preview --config dist/server/wrangler.json`

## Checks

```bash
npm run lint
npm run build
npx wrangler deploy --dry-run --no-bundle
```

Read [`agents.md`](agents.md) and the relevant documentation in [`arch/`](arch/) before making changes.
