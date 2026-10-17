import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   reactCompiler: true,
   turbopack : {
       resolveExtensions: ['.ts', '.tsx', '.js'],
   }
};

export default nextConfig;
