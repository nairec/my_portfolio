import { atom } from "nanostores";
import { defaultLocale, type Locale } from "./index";
import { clearChatSession } from "../chatStore";

export const LOCALE_COOKIE = "locale";

export const locale = atom<Locale>(defaultLocale);

export async function setLocale(next: Locale) {
    await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
    });

    clearChatSession();
    locale.set(next);
    window.location.assign(window.location.href);
}
