# Collector Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/collector/package.json ./apps/collector/
COPY packages/*/package.json ./packages/*/

# Copy package source code (needed for workspace dependencies)
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy app source code
COPY apps/collector/ ./apps/collector/

# Copy root tsconfig.json and other config files
COPY tsconfig.json ./
COPY turbo.json ./

# Build the collector
RUN pnpm --filter @testis/collector build

# Production stage
FROM node:18-alpine AS production

# Install wget for health checks
RUN apk add --no-cache wget

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/collector/package.json ./apps/collector/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=base /app/apps/collector/dist ./apps/collector/dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "apps/collector/dist/index.js"]