FROM node:20-bookworm-slim AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY .npmrc .npmrc
COPY patches ./patches
RUN pnpm fetch

FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --offline
RUN pnpm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/drizzle ./drizzle
EXPOSE 3000
CMD ["node", "dist/index.js"]

