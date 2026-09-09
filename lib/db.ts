import { PrismaClient } from "@/generated/prisma";
import { createPrismaAdapter, resolveDatabaseUrl } from "@/lib/prisma-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();
  const adapter = createPrismaAdapter(connectionString);
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
