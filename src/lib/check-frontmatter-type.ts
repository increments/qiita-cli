interface FrontMatter {
  title: string | null;
  tags: string[];
  secret: boolean;
  updatedAt: string | null;
  id: string | null;
  organizationUrlName: string | null;
  slide: boolean;
}

interface CheckType {
  getMessage: (item: FrontMatter) => string;
  isValid: (item: FrontMatter) => boolean;
}

export const checkFrontmatterType = (frontMatter: FrontMatter): string[] => {
  const checkFrontMatterTypes = [
    checkTitle,
    checkTags,
    checkSecret,
    checkUpdatedAt,
    checkId,
    checkOrganizationUrlName,
    checkSlide,
  ];
  return getErrorMessages(frontMatter, checkFrontMatterTypes);
};

const checkTitle: CheckType = {
  getMessage: () => "titleは文字列で入力してください",
  isValid: ({ title }) => {
    return title === null || typeof title === "string";
  },
};

const checkTags: CheckType = {
  getMessage: () => "tagsは配列で入力してください",
  isValid: ({ tags }) => {
    return Array.isArray(tags);
  },
};

const checkSecret: CheckType = {
  getMessage: () => "privateの設定はtrue/falseで入力してください",
  isValid: ({ secret }) => {
    return typeof secret === "boolean";
  },
};

const checkUpdatedAt: CheckType = {
  getMessage: () => "updated_atは文字列で入力してください",
  isValid: ({ updatedAt }) => {
    return updatedAt === null || typeof updatedAt === "string";
  },
};

const checkOrganizationUrlName: CheckType = {
  getMessage: () => "organization_url_nameは文字列で入力してください",
  isValid: ({ organizationUrlName }) => {
    return (
      organizationUrlName === null || typeof organizationUrlName === "string"
    );
  },
};

const checkSlide: CheckType = {
  getMessage: () =>
    "slideの設定はtrue/falseで入力してください（破壊的な変更がありました。詳しくはリリースをご確認ください https://github.com/increments/qiita-cli/releases/tag/v0.5.0）",
  isValid: ({ slide }) => {
    return typeof slide === "boolean";
  },
};

const checkId: CheckType = {
  getMessage: () => "idは文字列で入力してください",
  isValid: ({ id }) => {
    return id === null || typeof id === "string";
  },
};

const getErrorMessages = (
  frontMatter: FrontMatter,
  checkTypes: CheckType[],
): string[] => {
  return checkTypes.reduce((errorMessages: string[], checkType) => {
    if (!checkType.isValid(frontMatter)) {
      errorMessages.push(checkType.getMessage(frontMatter));
    }
    return errorMessages;
  }, []);
};
