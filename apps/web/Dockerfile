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
COPY packages/shared/package.json packages/shared/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS prod-deps
RUN pnpm prune --prod

FROM deps AS builder
COPY . .
RUN pnpm --filter web build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/web

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/server.mjs ./server.mjs
COPY --from=builder /app/apps/web/dist ./dist

USER nodeapp

EXPOSE 5137
ENV PORT=5137
ENV HOSTNAME=0.0.0.0
ENV FONTCONFIG_PATH=/var/task/fonts

CMD ["node", "server.mjs"]
