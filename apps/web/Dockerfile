# Web Dashboard Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for all packages first
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/
COPY packages/analytics/package.json ./packages/analytics/
COPY packages/tracking/package.json ./packages/tracking/

# Install dependencies first
RUN pnpm install --no-frozen-lockfile

# Copy package source code (needed for workspace dependencies)
COPY packages/ ./packages/

# Copy app source code
COPY apps/web/ ./apps/web/

# Copy root tsconfig.json and other config files
COPY tsconfig.json ./
COPY turbo.json ./

# Build packages first
RUN pnpm --filter @testis/ui build
RUN pnpm --filter @testis/database build
RUN pnpm --filter @testis/analytics build

# Build the web app
RUN pnpm --filter @testis/web build

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files for all packages first
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/
COPY packages/analytics/package.json ./packages/analytics/
COPY packages/tracking/package.json ./packages/tracking/

# Copy package source code (needed for workspace dependencies)
COPY packages/ ./packages/

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built applications and packages
COPY --from=base /app/apps/web/.next ./apps/web/.next
COPY --from=base /app/apps/web/public ./apps/web/public
COPY --from=base /app/packages/ui/dist ./packages/ui/dist
COPY --from=base /app/packages/database/dist ./packages/database/dist
COPY --from=base /app/packages/analytics/dist ./packages/analytics/dist
COPY --from=base /app/packages/database/prisma ./packages/database/prisma

# Copy node_modules for packages (needed for runtime)
COPY --from=base /app/node_modules ./node_modules

# Copy Next.js config
COPY --from=base /app/apps/web/next.config.js ./apps/web/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
WORKDIR /app/apps/web
CMD ["pnpm", "start"]