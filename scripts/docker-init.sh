#!/bin/bash

# Docker initialization script for Testis
# This script handles database setup and migrations

set -e

echo "🚀 Starting Testis Docker initialization..."

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL
until pg_isready -h postgres -p 5432 -U testis; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Wait for Redis
until redis-cli -h redis ping; do
  echo "Waiting for Redis..."
  sleep 2
done

# Wait for ClickHouse
until wget --quiet --tries=1 --spider http://clickhouse:8123/ping; do
  echo "Waiting for ClickHouse..."
  sleep 2
done

echo "✅ All services are ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
cd /app/packages/database
npx prisma migrate deploy

# Seed initial data if needed
echo "🌱 Seeding initial data..."
cd /app
node scripts/seed-api-keys.js

echo "🎉 Testis initialization complete!"