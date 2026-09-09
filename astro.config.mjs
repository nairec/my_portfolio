// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

import react from "@astrojs/react";
import {
  IMAGE_CACHE_TTL_SECONDS,
  VERCEL_IMAGE_QUALITIES,
  VERCEL_IMAGE_SIZES,
} from "./src/lib/imageOptimization.ts";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  output: "server",
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [...VERCEL_IMAGE_SIZES],
      domains: [],
      remotePatterns: [],
      minimumCacheTTL: IMAGE_CACHE_TTL_SECONDS,
      formats: ["image/webp"],
      qualities: [...VERCEL_IMAGE_QUALITIES],
    },
  }),
  integrations: [react()],
  build: {
    inlineStylesheets: "always",
  },
});
