import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveDirectDatabaseUrl } from "./lib/prisma-adapter";

const datasourceUrl = resolveDirectDatabaseUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});
