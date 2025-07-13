// eslint-disable-next-line no-control-regex -- include control characters
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/;

export interface FilenameValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFilename(filename: string): FilenameValidationResult {
  if (!filename || filename.trim().length === 0) {
    return {
      isValid: false,
      error: "Filename is empty",
    };
  }

  if (INVALID_FILENAME_CHARS.test(filename)) {
    return {
      isValid: false,
      error:
        'Filename contains invalid characters: < > : " / \\ | ? * and control characters',
    };
  }

  if (
    filename.startsWith(".") ||
    filename.endsWith(".") ||
    filename.startsWith(" ") ||
    filename.endsWith(" ")
  ) {
    return {
      isValid: false,
      error: "Filename cannot start or end with a dot or space",
    };
  }

  return {
    isValid: true,
  };
}
