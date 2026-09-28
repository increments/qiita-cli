import matter from "gray-matter";

export const isSlideMarkdown = (fileContent: string) =>
  matter(fileContent).data.marp === true;
