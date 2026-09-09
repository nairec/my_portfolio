/** Allowed Vercel Image Optimization qualities. Keep a single value to cut variants. */
export const IMAGE_QUALITY = 75;

/** Blog hover + article banner share this width so they hit one cache entry. */
export const BLOG_IMAGE_WIDTH = 1600;

/** Project card 1x / 2x. Must stay inside `VERCEL_IMAGE_SIZES`. */
export const PROJECT_IMAGE_WIDTH = 640;
export const PROJECT_IMAGE_WIDTH_2X = 1280;

/**
 * Allowlist for `/_vercel/image?w=`. Extra widths = extra transformations and cache writes.
 * Default Vercel/Astro list is 8+ sizes; we only emit what the UI actually requests.
 */
export const VERCEL_IMAGE_SIZES = [
    PROJECT_IMAGE_WIDTH,
    PROJECT_IMAGE_WIDTH_2X,
    BLOG_IMAGE_WIDTH,
] as const;

/** 31 days. Blog/project assets are immutable per deploy; longer TTL = fewer cache writes. */
export const IMAGE_CACHE_TTL_SECONDS = 2_678_400;
