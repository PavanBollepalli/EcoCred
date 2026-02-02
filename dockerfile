# 1. Base image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./
COPY bun.lockb* ./
RUN npm install -g pnpm

# 2. Dependencies layer
FROM base AS deps
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# 3. Build layer
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# MongoDB environment variables (set these in your deployment)
ENV MONGODB_URI=mongodb://localhost:27017/ecocred

# Create user (non-root for security)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
