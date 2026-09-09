import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

const LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/atelier?sslmode=disable";

export function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    LOCAL_DATABASE_URL
  );
}

export function createPrismaAdapter(connectionString: string) {
  const isNeon =
    connectionString.includes("neon.tech") ||
    connectionString.includes("-pooler");

  if (isNeon) {
    return new PrismaNeon({ connectionString });
  }

  return new PrismaPg({ connectionString });
}
