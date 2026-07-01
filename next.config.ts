import type { NextConfig } from "next";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) ?? ["localhost:3000"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
