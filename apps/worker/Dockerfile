# Worker Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build packages
RUN pnpm --filter @testis/database build
RUN pnpm --filter @testis/analytics build
RUN pnpm --filter @testis/worker build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/*/package.json ./packages/*/

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built applications and packages
COPY --from=base /app/apps/worker/dist ./apps/worker/dist
COPY --from=base /app/packages/database/dist ./packages/database/dist
COPY --from=base /app/packages/analytics/dist ./packages/analytics/dist
COPY --from=base /app/packages/database/prisma ./packages/database/prisma

# Copy node_modules for packages (needed for runtime)
COPY --from=base /app/node_modules ./node_modules

# Start the application
CMD ["node", "apps/worker/dist/index.js"]