import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Prisma 7 + Turbopack: without this, dev can rewrite `@prisma/client` imports to
   * non-existent hashed externals (`@prisma/client-xxxx/runtime/client`). Bundling
   * these packages avoids that (see prisma/prisma#29025).
   */
  transpilePackages: ["@prisma/client", "@prisma/adapter-pg"],
  /** Native driver — keep external so Node loads the CJS build correctly. */
  serverExternalPackages: ["pg"],
};

export default nextConfig;
