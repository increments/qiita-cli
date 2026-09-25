import { handleError } from "../lib/error-handler";
import { helpText } from "./help";
import { exec } from "./index";

jest.mock("../lib/error-handler");
jest.mock("../lib/package-update-notice");
jest.mock("./help");
jest.mock("./init");
jest.mock("./login");
jest.mock("./newArticles");
jest.mock("./postingCampaigns");
jest.mock("./preview");
jest.mock("./publish");
jest.mock("./pull");
jest.mock("./version");

const mockHandleError = jest.mocked(handleError);

describe("exec", () => {
  class ProcessExitError extends Error {
    constructor(public readonly code: string | number | null | undefined) {
      super(`process.exit(${code})`);
    }
  }

  let exitSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((code?: string | number | null) => {
        throw new ProcessExitError(code);
      });
    errorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("when the command is unknown", () => {
    it("prints the help text and exits with 1", async () => {
      await expect(exec("unknown-command", [])).rejects.toThrow(
        ProcessExitError,
      );

      expect(errorSpy).toHaveBeenCalledWith(helpText);
      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });
});
