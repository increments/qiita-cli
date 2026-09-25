import { checkSlideFrontmatterType } from "../check-slide-frontmatter-type";

interface Slide {
  title: string | null;
  rawBody: string | null;
}

interface PublishSlide extends Slide {
  id: string | null;
  updatedAt: string | null;
  description: string | null;
  ignorePublish: boolean;
  isOlderThanRemote: boolean;
}

interface Validator {
  getMessage: (slide: Slide) => string;
  isValid: (slide: Slide) => boolean;
}

export const validateSlide = (slide: Slide): string[] => {
  const validators = [validateSlideTitle, validateSlideRawBody];
  return getValidationErrorMessages(slide, validators);
};

// The frontmatter type check, the value validation and the staleness check are
// reported one tier at a time, as with articles.
export const validatePublishSlide = (
  slide: PublishSlide,
  { force }: { force: boolean },
): string[] => {
  const frontmatterErrors = checkSlideFrontmatterType(slide);
  if (frontmatterErrors.length > 0) return frontmatterErrors;

  const validationErrors = validateSlide(slide);
  if (validationErrors.length > 0) return validationErrors;

  if (!force && slide.isOlderThanRemote) {
    return ["内容がQiita上のスライドより古い可能性があります"];
  }

  return [];
};

const validateSlideTitle: Validator = {
  getMessage: () => "タイトルを入力してください",
  isValid: ({ title }) => {
    if (!title) return false;
    return title.length > 0;
  },
};

const validateSlideRawBody: Validator = {
  getMessage: () => "本文を入力してください",
  isValid: ({ rawBody }) => {
    if (!rawBody) return false;
    return rawBody.length > 0;
  },
};

const getValidationErrorMessages = (
  slide: Slide,
  validators: Validator[],
): string[] => {
  return validators.reduce((errorMessages: string[], validator) => {
    if (!validator.isValid(slide)) {
      errorMessages.push(validator.getMessage(slide));
    }
    return errorMessages;
  }, []);
};
