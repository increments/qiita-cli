// eslint-disable-next-line no-control-regex -- include control characters
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/;

export const ERROR_FILENAME_EMPTY = "Filename is empty";
export const ERROR_INVALID_CHARACTERS =
  'Filename contains invalid characters: < > : " / \\ | ? * and control characters';
export const ERROR_INVALID_START_END =
  "Filename cannot start or end with a dot or space";

export interface FilenameValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFilename(filename: string): FilenameValidationResult {
  if (!filename || filename.trim().length === 0) {
    return {
      isValid: false,
      error: ERROR_FILENAME_EMPTY,
    };
  }

  if (INVALID_FILENAME_CHARS.test(filename)) {
    return {
      isValid: false,
      error: ERROR_INVALID_CHARACTERS,
    };
  }

  if (/^[. ]|[. ]$/.test(filename)) {
    return {
      isValid: false,
      error: ERROR_INVALID_START_END,
    };
  }

  return {
    isValid: true,
  };
}
