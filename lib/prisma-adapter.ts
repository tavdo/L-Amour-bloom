import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

const LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/atelier?sslmode=disable";

const POOLED_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
] as const;

const DIRECT_ENV_KEYS = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
] as const;

function firstEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
}

export function resolveDatabaseUrl(): string {
  return firstEnv(POOLED_ENV_KEYS) || firstEnv(DIRECT_ENV_KEYS) || LOCAL_DATABASE_URL;
}

export function resolveDirectDatabaseUrl(): string {
  return firstEnv(DIRECT_ENV_KEYS) || firstEnv(POOLED_ENV_KEYS) || LOCAL_DATABASE_URL;
}

export function isRemoteDatabaseUrl(connectionString: string): boolean {
  return !/localhost|127\.0\.0\.1/i.test(connectionString);
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
