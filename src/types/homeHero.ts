export const desktopHeroModes = ["cinema", "panorama", "spotlight"] as const;
export type DesktopHeroMode = (typeof desktopHeroModes)[number];

export function isDesktopHeroMode(value: string | undefined): value is DesktopHeroMode {
    return desktopHeroModes.includes(value as DesktopHeroMode);
}
