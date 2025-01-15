# syntax=docker.io/docker/dockerfile:1

FROM node:23.6.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /  

# Install all dependencies using pnpm
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install

# Production image
FROM base AS runner
WORKDIR /  

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backenduser

COPY . .

USER backenduser

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["npx", "pnpm", "run", "start"]