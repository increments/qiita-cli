// `fs.readdir(..., { recursive: true })` が返す相対パスの区切り文字は OS 依存のため、
// ".remote/" だけでなく ".remote\" (Windows) も除外できるように先頭セグメントで判定する。
export const isLocalMarkdownFilename = (filename: string): boolean =>
  /\.md$/.test(filename) && filename.split(/[\\/]/)[0] !== ".remote";
