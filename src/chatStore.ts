import { atom } from "nanostores";
import type { Message } from "./types/types";
import type { Locale } from "./i18n";

const STORAGE_KEY = "chat-messages";
const LOCALE_KEY = "chat-locale";

export const chatMessages = atom<Message[]>([]);

chatMessages.listen((messages) => {
    if (typeof window !== "undefined" && messages.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
});

function hasValidHistory(messages: Message[]): boolean {
    return messages.some((m) => m.content.trim().length > 0);
}

export function resetChatForLocale(locale: Locale, greeting: string) {
    const initial: Message[] = [{ role: "assistant", content: greeting }];
    sessionStorage.setItem(LOCALE_KEY, locale);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    chatMessages.set(initial);
}

export function initChatStore(locale: Locale, greeting: string) {
    if (typeof window === "undefined") return;

    const storedLocale = sessionStorage.getItem(LOCALE_KEY);

    if (storedLocale !== locale) {
        resetChatForLocale(locale, greeting);
        return;
    }

    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) {
        resetChatForLocale(locale, greeting);
        return;
    }

    try {
        const parsed = JSON.parse(saved) as Message[];
        if (!hasValidHistory(parsed)) {
            resetChatForLocale(locale, greeting);
            return;
        }
        chatMessages.set(parsed);
    } catch {
        resetChatForLocale(locale, greeting);
    }
}

export function clearChatSession() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LOCALE_KEY);
    chatMessages.set([]);
}
