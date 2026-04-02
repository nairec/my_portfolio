import { atom } from "nanostores";

const initialMode =
  typeof window !== "undefined"
    ? localStorage.getItem("project-mode") || "serious"
    : "serious";

export const mode = atom(initialMode);

mode.listen((value) => {
  localStorage.setItem("project-mode", value);
});
