export class QiitaFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaFetchError";
  }
}

export class QiitaBadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaBadRequestError";
  }
}

export class QiitaUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaUnauthorizedError";
  }
}

export class QiitaForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaForbiddenError";
  }
}

export class QiitaNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaNotFoundError";
  }
}

export class QiitaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaRateLimitError";
  }
}

export class QiitaInternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaInternalServerError";
  }
}

export class QiitaUnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QiitaUnknownError";
  }
}

export class QiitaForbiddenOrBadRequestError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    // @ts-expect-error This error is fixed in ES2022.
    super(message, options);
    this.name = "QiitaForbiddenOrBadRequestError";
  }
}
