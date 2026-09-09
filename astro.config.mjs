// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

import react from "@astrojs/react";
import {
  IMAGE_CACHE_TTL_SECONDS,
  IMAGE_QUALITY,
  VERCEL_IMAGE_SIZES,
} from "./src/lib/imageOptimization.ts";

/** Fields in Vercel Build Output `images` that the adapter forwards but may omit from its TS type. */
const imageCostLimits = {
  localPatterns: [{ pathname: "^/?_astro/.*$" }],
  qualities: [IMAGE_QUALITY],
};

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
      ...imageCostLimits,
    },
  }),
  integrations: [react()],
  build: {
    inlineStylesheets: "always",
  },
});
