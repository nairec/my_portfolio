import type { Translations } from "../i18n";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type ProjectSlug = keyof Translations["projects"]["descriptions"];

export interface Project {
  name: string;
  slug: ProjectSlug;
  year: number;
  description: string;
  link: string;
  type: "serious" | "fun";
  imgPath: string;
  stack: string[];
  width: number;
  height: number;
}
