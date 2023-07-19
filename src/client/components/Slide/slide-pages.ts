import { escape } from "./escape";

export const slidePages = (article: {
  title: string;
  author: { urlName: string };
  body: string;
}): string[] => [
  `<h1>${escape(
    article.title
  )}</h1><div class="slideMode-Viewer_content--firstSlideAuthor">by ${
    article.author.urlName
  }</div>`,
  ...article.body.split(/<hr.*?>/),
];
