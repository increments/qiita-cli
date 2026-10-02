import {
  QiitaApi,
  QiitaBetaFeatureRequiredError,
  QiitaForbiddenError,
} from "./index";

describe("QiitaApi", () => {
  const qiitaApi = new QiitaApi({ token: "token" });
  const mockFetch = jest.spyOn(global, "fetch");

  afterAll(() => {
    mockFetch.mockRestore();
  });

  describe("when the response is 403", () => {
    it("throws QiitaBetaFeatureRequiredError if a beta feature is required", async () => {
      mockFetch.mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Beta feature required",
            type: "beta_feature_required",
          }),
          { status: 403 },
        ),
      );

      await expect(qiitaApi.authenticatedUserSlides()).rejects.toThrow(
        QiitaBetaFeatureRequiredError,
      );
    });

    it("throws QiitaForbiddenError otherwise", async () => {
      mockFetch.mockResolvedValue(
        new Response(
          JSON.stringify({ message: "Forbidden", type: "forbidden" }),
          { status: 403 },
        ),
      );

      await expect(qiitaApi.authenticatedUserSlides()).rejects.toThrow(
        QiitaForbiddenError,
      );
    });

    it("throws QiitaForbiddenError if the body is not JSON", async () => {
      mockFetch.mockResolvedValue(new Response("Forbidden", { status: 403 }));

      await expect(qiitaApi.authenticatedUserSlides()).rejects.toThrow(
        QiitaForbiddenError,
      );
    });
  });
});
