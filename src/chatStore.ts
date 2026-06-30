import { atom } from "nanostores";
import type { Message } from "./types/types";

const STORAGE_KEY = "chat-messages";

const defaultMessages: Message[] = [
  { role: "assistant", content: "Hi! I'm iREC, a digital representative of Eric. Feel free to ask me anything!" },
];

function loadMessages(): Message[] {
  if (typeof window === "undefined") return defaultMessages;
  const saved = sessionStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultMessages;
}

export const chatMessages = atom<Message[]>(loadMessages());

chatMessages.listen((messages) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
});