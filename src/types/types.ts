import type { Translations } from "../i18n";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type ProjectSlug = keyof Translations["projects"]["descriptions"];

export type ProjectCategory = "ai" | "web-app" | "automation";

export interface Project {
  name: string;
  slug: ProjectSlug;
  year: number;
  description: string;
  link: string;
  categories: ProjectCategory[];
  imgPath: string;
  stack: string[];
  width: number;
  height: number;
}
