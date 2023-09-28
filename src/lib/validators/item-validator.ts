interface Item {
  title: string | null;
  rawBody: string | null;
  tags: string[];
  secret: boolean;
  organizationUrlName: string | null;
}

interface Validator {
  getMessage: (item: Item) => string;
  isValid: (item: Item) => boolean;
}

export const validateItem = (item: Item): string[] => {
  const validators = [
    validateItemTitle,
    validateItemRawBody,
    validateItemTags,
    validateLengthItemTags,
    validateOrganizationSecretItem,
  ];
  return getValidationErrorMessages(item, validators);
};

const validateItemTitle: Validator = {
  getMessage: () => "タイトルを入力してください",
  isValid: ({ title }) => {
    if (!title) return false;
    return title.length > 0;
  },
};

const validateItemRawBody: Validator = {
  getMessage: () => "本文を入力してください",
  isValid: ({ rawBody }) => {
    if (!rawBody) return false;
    return rawBody.length > 0;
  },
};

const validateItemTags: Validator = {
  getMessage: () => "タグを入力してください",
  isValid: ({ tags }) => {
    return Array.isArray(tags) && tags.every((value) => value !== "");
  },
};

const validateLengthItemTags: Validator = {
  getMessage: () => "タグは1つ以上、5つ以内で指定してください",
  isValid: ({ tags }) => {
    return 0 < tags.length && tags.length <= 5;
  },
};

const validateOrganizationSecretItem: Validator = {
  getMessage: () => "限定共有記事にOrganizationを紐付けることはできません",
  isValid: ({ organizationUrlName, secret }) => {
    if (secret && organizationUrlName) return false;
    return true;
  },
};

const getValidationErrorMessages = (
  item: Item,
  validators: Validator[],
): string[] => {
  return validators.reduce((errorMessages: string[], validator) => {
    if (!validator.isValid(item)) {
      errorMessages.push(validator.getMessage(item));
    }
    return errorMessages;
  }, []);
};
