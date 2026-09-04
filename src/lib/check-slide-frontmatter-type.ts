interface SlideFrontMatter {
  title: string | null;
  id: string | null;
  updatedAt: string | null;
  description: string | null;
}

interface CheckType {
  getMessage: (slide: SlideFrontMatter) => string;
  isValid: (slide: SlideFrontMatter) => boolean;
}

export const checkSlideFrontmatterType = (
  frontMatter: SlideFrontMatter,
): string[] => {
  const checkFrontMatterTypes = [
    checkTitle,
    checkId,
    checkUpdatedAt,
    checkDescription,
  ];
  return getErrorMessages(frontMatter, checkFrontMatterTypes);
};

const checkTitle: CheckType = {
  getMessage: () => "titleは文字列で入力してください",
  isValid: ({ title }) => {
    return title === null || typeof title === "string";
  },
};

const checkId: CheckType = {
  getMessage: () => "idは文字列で入力してください",
  isValid: ({ id }) => {
    return id === null || typeof id === "string";
  },
};

const checkUpdatedAt: CheckType = {
  getMessage: () => "updated_atは文字列で入力してください",
  isValid: ({ updatedAt }) => {
    return updatedAt === null || typeof updatedAt === "string";
  },
};

const checkDescription: CheckType = {
  getMessage: () => "descriptionは文字列で入力してください",
  isValid: ({ description }) => {
    return description === null || typeof description === "string";
  },
};

const getErrorMessages = (
  frontMatter: SlideFrontMatter,
  checkTypes: CheckType[],
): string[] => {
  return checkTypes.reduce((errorMessages: string[], checkType) => {
    if (!checkType.isValid(frontMatter)) {
      errorMessages.push(checkType.getMessage(frontMatter));
    }
    return errorMessages;
  }, []);
};
