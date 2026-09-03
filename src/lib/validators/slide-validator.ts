interface Slide {
  title: string | null;
  rawBody: string | null;
}

interface Validator {
  getMessage: (slide: Slide) => string;
  isValid: (slide: Slide) => boolean;
}

export const validateSlide = (slide: Slide): string[] => {
  const validators = [validateSlideTitle, validateSlideRawBody];
  return getValidationErrorMessages(slide, validators);
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
