import {
  QiitaBadRequestError,
  QiitaForbiddenOrBadRequestError,
  QiitaNotFoundError,
} from "../qiita-api";
import { handleError } from "./error-handler";

// chalk is ESM-only; stub it so the dynamic import() works under ts-jest's
// CommonJS transform.
jest.mock(
  "chalk",
  () => ({
    __esModule: true,
    default: {
      red: Object.assign((s: string) => s, { bold: (s: string) => s }),
    },
  }),
  { virtual: true },
);

describe("handleError", () => {
  let errorSpy: jest.SpyInstance;

  const printedMessages = () =>
    errorSpy.mock.calls.map(([message]) => message as string).join("\n");

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("mentions articles and slides on a bad request", async () => {
    await handleError(new QiitaBadRequestError("bad request"));

    expect(printedMessages()).toContain(
      "  記事、スライドファイルに不備がないかご確認ください",
    );
  });

  it("mentions articles and slides on a forbidden or bad request", async () => {
    await handleError(new QiitaForbiddenOrBadRequestError("forbidden"));

    expect(printedMessages()).toContain(
      "  記事、スライドファイルに不備がないかご確認ください",
    );
  });

  it("mentions articles and slides when not found", async () => {
    await handleError(new QiitaNotFoundError("not found"));

    expect(printedMessages()).toContain("記事、スライドが見つかりませんでした");
    expect(printedMessages()).toContain(
      "  Qiita上で記事、スライドが削除されていないかご確認ください",
    );
  });
});
