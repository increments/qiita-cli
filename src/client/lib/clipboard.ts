export const writeClipboard = (text: string) => {
  return navigator.clipboard.writeText(text);
};
