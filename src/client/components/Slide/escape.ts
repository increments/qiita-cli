const REGEXP = /[&'`"<>]/g;

const map = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;",
};

const replace = (match: keyof typeof map) => map[match];

export const escape = (html: string): string =>
  html.replace(REGEXP, replace as any); // eslint-disable-line @typescript-eslint/no-explicit-any
