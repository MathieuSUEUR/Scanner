import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empêche "next dev" de créer AGENTS.md et CLAUDE.md
  agentRules: false,
};

export default nextConfig;
