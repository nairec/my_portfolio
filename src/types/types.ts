export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Project {
  name: string;
  slug: string;
  year: number;
  description: string;
  link: string;
  type: "serious" | "fun";
  imgPath: string;
  stack: string[];
  width: number;
  height: number;
}
