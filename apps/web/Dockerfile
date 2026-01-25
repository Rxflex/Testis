# Web Dashboard Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build packages first
RUN pnpm --filter @testis/ui build
RUN pnpm --filter @testis/database build
RUN pnpm --filter @testis/analytics build

# Build the web app
RUN pnpm --filter @testis/web build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

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
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
WORKDIR /app/apps/web
CMD ["pnpm", "start"]