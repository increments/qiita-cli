// The path separator in the relative paths returned by
// `fs.readdir(..., { recursive: true })` depends on the OS, so check the first
// segment to exclude both ".remote/" and ".remote\\" (Windows).
export const isLocalMarkdownFilename = (filename: string): boolean =>
  /\.md$/.test(filename) && filename.split(/[\\/]/)[0] !== ".remote";
