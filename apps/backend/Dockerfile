# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS prod-deps
RUN pnpm prune --prod

FROM deps AS builder
COPY . .
RUN pnpm --filter backend build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/backend

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/apps/backend/dist ./dist

USER nodeapp

EXPOSE 3000
ENV PORT=3000
ENV CORS_ORIGIN=http://localhost:5137

CMD ["node", "dist/index.js"]
