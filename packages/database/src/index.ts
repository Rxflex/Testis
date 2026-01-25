import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export types
export type { User, Project, Domain, ApiKey } from '@prisma/client'

// Export Prisma client
export { PrismaClient } from '@prisma/client'