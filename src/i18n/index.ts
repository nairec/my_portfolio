import en from "./locales/en.json";
import es from "./locales/es.json";
import ca from "./locales/ca.json";

export const locales = ["en", "es", "ca"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, es, ca };

export function getTranslations(locale: Locale): Translations {
    return translations[locale] ?? translations[defaultLocale];
}

export function isLocale(value: string): value is Locale {
    return locales.includes(value as Locale);
}

/** Maps browser / Accept-Language tags to a supported locale. */
export function resolveLocale(input: string | null | undefined): Locale {
    if (!input) return defaultLocale;

    const normalized = input.trim().toLowerCase();

    if (isLocale(normalized)) return normalized;

    const primary = normalized.split("-")[0];
    if (isLocale(primary)) return primary;

    if (primary === "ca" || normalized.startsWith("ca-")) return "ca";
    if (primary === "es") return "es";
    if (primary === "en") return "en";

    return defaultLocale;
}

export function parseAcceptLanguage(header: string | null): Locale {
    if (!header) return defaultLocale;

    const candidates = header
        .split(",")
        .map((part) => {
            const [lang, qPart] = part.trim().split(";q=");
            return {
                lang: lang.trim().toLowerCase(),
                q: qPart ? parseFloat(qPart) : 1,
            };
        })
        .sort((a, b) => b.q - a.q);

    for (const { lang } of candidates) {
        if (lang.startsWith("ca")) return "ca";
        if (lang.startsWith("es")) return "es";
        if (lang.startsWith("en")) return "en";
    }

    return defaultLocale;
}
