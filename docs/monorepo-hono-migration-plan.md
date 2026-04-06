# ResumeLab Monorepo + Hono Backend Migration Plan

## Goal

Refactor the current single-repo TanStack Start project into a frontend-backend separated monorepo using `pnpm workspace`.

Target architecture:

- `apps/web`: frontend app
- `apps/backend`: Hono backend service
- `packages/shared`: shared types, schemas, prompts, and AI config

This plan intentionally does not introduce `turbo` in the first phase. `pnpm workspace` is enough for the current project size and keeps the migration simpler.

## Why This Refactor Makes Sense

The current project is not a heavy backend application. Its server-side responsibilities are mainly a few API handlers embedded inside TanStack Start:

- resume polish
- grammar check
- resume import / parse
- image proxy

There is no database migration, no user system, and no large domain service to untangle. That makes this project a good candidate for extracting a lightweight Hono backend.

## Current Backend Coupling

The current API handlers live in:

- `src/routes/api/polish.ts`
- `src/routes/api/grammar.ts`
- `src/routes/api/resume-import.ts`
- `src/routes/api/proxy/image.ts`

The frontend currently calls them directly with relative paths such as:

- `fetch("/api/polish")`
- `fetch("/api/grammar")`
- `fetch("/api/resume-import")`

Main call sites include:

- `src/components/shared/ai/AIPolishDialog.tsx`
- `src/store/useGrammarStore.ts`
- `src/app/app/dashboard/resumes/ResumeWorkbench.tsx`

## Recommended Monorepo Structure

```text
resume-lab/
  apps/
    web/
      src/
      public/
      package.json
      vite.config.ts
      tsconfig.json
    backend/
      src/
        index.ts
        app.ts
        routes/
          health.ts
          resume/
            polish.ts
            grammar.ts
            import.ts
          media/
            image-proxy.ts
        services/
          ai/
            gemini.ts
            openai-compatible.ts
        middleware/
          cors.ts
          error.ts
        utils/
          response.ts
          stream.ts
      package.json
      tsconfig.json
  packages/
    shared/
      src/
        ai/
          config.ts
        prompts/
          resume.ts
        types/
          api.ts
          resume.ts
        schemas/
          ai.ts
          resume.ts
      package.json
      tsconfig.json
    tsconfig/
      base.json
      web.json
      backend.json
  package.json
  pnpm-workspace.yaml
  tsconfig.json
```

## Package Responsibilities

### `apps/web`

Responsibilities:

- UI, pages, components, templates, editor interactions
- Zustand stores and i18n
- frontend-only export logic
- API calls through a centralized API client

Important changes:

- remove or deprecate `src/routes/api/*`
- stop using embedded TanStack Start server handlers for business APIs
- use `VITE_API_BASE_URL` to call `apps/backend`

### `apps/backend`

Responsibilities:

- expose HTTP APIs through Hono
- validate requests
- normalize AI provider calls
- stream polish responses
- provide image proxy API

Recommended endpoints:

- `GET /health`
- `POST /v1/resume/polish`
- `POST /v1/resume/grammar`
- `POST /v1/resume/import`
- `GET /v1/media/image-proxy`

### `packages/shared`

Responsibilities:

- shared TypeScript types
- shared request/response DTOs
- shared AI model config
- shared resume prompts
- shared Zod schemas

Move these first:

- `src/config/ai.ts`
- `src/prompt/resume.ts`
- `src/types/resume.ts`

## Why `pnpm workspace` First

This migration does not need `turbo` in phase one.

Reasons:

- only two apps and one shared package
- the main difficulty is API extraction, not task orchestration
- `pnpm workspace` already solves dependency linking cleanly
- simpler setup means lower migration risk

`turbo` can be added later if the repo grows and you need:

- build caching
- parallelized CI tasks
- more internal packages
- more complex app/package dependency graphs

## Root Workspace Setup

### Root `package.json`

```json
{
  "name": "resume-lab",
  "private": true,
  "packageManager": "pnpm@10.3.0",
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev": "pnpm -r --parallel --filter web --filter backend dev",
    "build:web": "pnpm --filter web build",
    "build:backend": "pnpm --filter backend build",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

### Root `tsconfig.json`

```json
{
  "extends": "./packages/tsconfig/base.json"
}
```

## `apps/web` Setup

`apps/web` will contain most of the current repository content.

### Suggested `apps/web/package.json`

```json
{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node server.mjs",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

### Frontend API Client

Add a centralized client:

`apps/web/src/lib/api.ts`

```ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
```

Then replace direct calls like:

- `fetch("/api/polish")`
- `fetch("/api/grammar")`
- `fetch("/api/resume-import")`

with absolute backend requests built from `apiUrl(...)`.

## `apps/backend` Setup

### Recommended Dependencies

Suggested `apps/backend/package.json`:

```json
{
  "name": "backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.7.0",
    "@hono/node-server": "^1.13.0",
    "@hono/zod-validator": "^0.4.0",
    "zod": "^3.24.0",
    "undici": "^7.22.0",
    "@google/generative-ai": "^0.24.1",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "tsx": "^4.21.0",
    "typescript": "^5.0.0"
  }
}
```

### Backend Entry

`apps/backend/src/index.ts`

```ts
import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT || 3000);

serve({
  fetch: app.fetch,
  port,
});
```

### Backend App

`apps/backend/src/app.ts`

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./routes/health";
import { polishRoute } from "./routes/resume/polish";
import { grammarRoute } from "./routes/resume/grammar";
import { importRoute } from "./routes/resume/import";
import { imageProxyRoute } from "./routes/media/image-proxy";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5137",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.route("/health", healthRoute);
app.route("/v1/resume", polishRoute);
app.route("/v1/resume", grammarRoute);
app.route("/v1/resume", importRoute);
app.route("/v1/media", imageProxyRoute);
```

## Route Design

To stay close to the business-oriented route style used in `hi-offer-open`, group routes by domain:

- `POST /v1/resume/polish`
- `POST /v1/resume/grammar`
- `POST /v1/resume/import`
- `GET /v1/media/image-proxy`
- `GET /health`

This is preferred over a generic `/v1/ai/*` namespace because the routes represent resume-related business actions more clearly.

## Shared Package Design

`packages/shared` should contain pure shared logic only.

Recommended exports:

- `@resume-lab/shared/ai/config`
- `@resume-lab/shared/prompts/resume`
- `@resume-lab/shared/types/api`
- `@resume-lab/shared/types/resume`
- `@resume-lab/shared/schemas/ai`
- `@resume-lab/shared/schemas/resume`

Suggested `packages/shared/package.json`:

```json
{
  "name": "@resume-lab/shared",
  "private": true,
  "type": "module",
  "exports": {
    "./ai/config": "./src/ai/config.ts",
    "./prompts/resume": "./src/prompts/resume.ts",
    "./types/api": "./src/types/api.ts",
    "./types/resume": "./src/types/resume.ts",
    "./schemas/ai": "./src/schemas/ai.ts",
    "./schemas/resume": "./src/schemas/resume.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

## Environment Variables

### `apps/web/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

### `apps/backend/.env`

```env
PORT=3000
CORS_ORIGIN=http://localhost:5137
HTTP_PROXY=
HTTPS_PROXY=
```

If API keys are later moved from frontend-managed input to backend-managed secrets, add:

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
DOUBAO_API_KEY=
```

## Migration Steps

### Phase 1: Workspace Foundation

1. Create `apps/web`, `apps/backend`, and `packages/shared`
2. Add root `package.json`
3. Add `pnpm-workspace.yaml`
4. Add shared TypeScript config package

### Phase 2: Move Current Frontend into `apps/web`

1. Move current project files into `apps/web`
2. Keep existing frontend behavior unchanged
3. Ensure the frontend still builds and runs

### Phase 3: Build the Hono Backend

1. Create Hono entrypoint and app setup
2. Add health route
3. Add request validation with Zod
4. Add shared middleware for CORS and errors

### Phase 4: Migrate APIs Incrementally

Recommended order:

1. grammar
2. polish
3. resume import
4. image proxy

Reasoning:

- grammar and polish are easier to validate first
- resume import involves larger request bodies
- image proxy should be migrated last because it needs extra security review

### Phase 5: Switch Frontend to Backend Service

1. Add `src/lib/api.ts`
2. Replace direct relative `/api/*` calls
3. Use `VITE_API_BASE_URL`
4. Test both local and deployment environments

### Phase 6: Remove Old Embedded APIs

After the frontend is fully using `apps/backend`, remove:

- `src/routes/api/polish.ts`
- `src/routes/api/grammar.ts`
- `src/routes/api/resume-import.ts`
- `src/routes/api/proxy/image.ts`

## Current File Mapping

Suggested mapping from current files to the new backend:

- `src/routes/api/polish.ts` -> `apps/backend/src/routes/resume/polish.ts`
- `src/routes/api/grammar.ts` -> `apps/backend/src/routes/resume/grammar.ts`
- `src/routes/api/resume-import.ts` -> `apps/backend/src/routes/resume/import.ts`
- `src/routes/api/proxy/image.ts` -> `apps/backend/src/routes/media/image-proxy.ts`
- `src/lib/server/gemini.ts` -> `apps/backend/src/services/ai/gemini.ts`
- `src/config/ai.ts` -> `packages/shared/src/ai/config.ts`
- `src/prompt/resume.ts` -> `packages/shared/src/prompts/resume.ts`

## Risks and Technical Notes

### Streaming Response

`polish` uses streaming responses today. The Hono backend must preserve that behavior, because the frontend reader depends on it.

### Large Request Bodies

`resume-import` sends base64 PDF page images. This may become a request size concern, especially if the backend is deployed to more restrictive runtimes later.

### Security for Image Proxy

The image proxy should not be migrated as-is without review. It should be hardened against SSRF:

- block private IPs
- validate allowed protocols
- set timeouts
- consider allowlists if needed

### API Key Flow

Today the frontend sends API keys to the backend. That is acceptable for a transitional architecture, but long term it is better to move keys to backend-managed secrets.

### PDF Export

Current PDF export does not appear to be handled by this project's backend. It uses an external `PDF_EXPORT_CONFIG.SERVER_URL`.

Decision needed later:

- keep external PDF service
- or move PDF generation into `apps/backend`

## Deployment Recommendation

Keep deployment simple in phase one:

- deploy `apps/web` separately
- deploy `apps/backend` separately

Example:

- Web: `https://resumelab-web.example.com`
- Backend: `https://api.resumelab.example.com`

Then configure:

`apps/web/.env`

```env
VITE_API_BASE_URL=https://api.resumelab.example.com
```

`apps/backend/.env`

```env
CORS_ORIGIN=https://resumelab-web.example.com
```

## Final Recommendation

Use this migration path:

- `pnpm workspace`
- `apps/web`
- `apps/backend`
- `packages/shared`
- Hono running on Node.js
- no `turbo` in phase one

This gives the project a clean front-back separation with low migration risk and a straightforward future path if the repo grows.
