import { defineMiddleware } from "astro:middleware";
import {
    defaultLocale,
    isLocale,
    parseAcceptLanguage,
    type Locale,
} from "./i18n";

const LOCALE_COOKIE = "locale";

export const onRequest = defineMiddleware(async (context, next) => {
    const cookieValue = context.cookies.get(LOCALE_COOKIE)?.value;
    let locale: Locale = defaultLocale;

    if (cookieValue && isLocale(cookieValue)) {
        locale = cookieValue;
    } else {
        locale = parseAcceptLanguage(
            context.request.headers.get("accept-language"),
        );
        context.cookies.set(LOCALE_COOKIE, locale, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
            httpOnly: false,
        });
    }

    context.locals.locale = locale;

    return next();
});
