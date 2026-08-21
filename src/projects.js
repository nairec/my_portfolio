import { atom } from "nanostores";

export const ALL_CATEGORY = "all";
export const PROJECT_CATEGORIES = ["ai", "web-app", "automation", "alternative"];

const STORAGE_KEY = "project-category-filter";

const initialFilter =
  typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY) || ALL_CATEGORY
    : ALL_CATEGORY;

export const categoryFilter = atom(initialFilter);

categoryFilter.listen((value) => {
  localStorage.setItem(STORAGE_KEY, value);
});
