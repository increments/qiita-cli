import * as fetchPackageVersion from "./fetch-package-version";
import { getLatestPackageVersion } from "./get-latest-package-version";
import type { CacheData } from "./package-version-cache";
import * as packageVersionCache from "./package-version-cache";

describe("getLatestPackageVersion", () => {
  const mockFetchLatestPackageVersion = jest.spyOn(
    fetchPackageVersion,
    "fetchLatestPackageVersion",
  );
  const mockGetCacheData = jest.spyOn(packageVersionCache, "getCacheData");
  const mockSetCacheData = jest.spyOn(packageVersionCache, "setCacheData");
  const mockDateNow = jest.spyOn(Date, "now");

  beforeEach(() => {
    mockFetchLatestPackageVersion.mockReset();
    mockGetCacheData.mockReset();
    mockSetCacheData.mockReset();
  });

  describe("when cache exists and not expired", () => {
    const cacheData: CacheData = {
      lastCheckedAt: new Date("2023-07-13T00:00:00.000Z").getTime(),
      latestVersion: "0.0.0",
    };

    beforeEach(() => {
      mockGetCacheData.mockReturnValue(cacheData);
      mockDateNow.mockReturnValue(
        new Date("2023-07-13T11:00:00.000Z").getTime(),
      );
    });

    it("returns cached version", async () => {
      expect(await getLatestPackageVersion()).toEqual("0.0.0");
      expect(mockGetCacheData).toHaveBeenCalled();
      expect(mockFetchLatestPackageVersion).not.toHaveBeenCalled();
      expect(mockDateNow).toHaveBeenCalled();
      expect(mockSetCacheData).not.toHaveBeenCalled();
    });
  });

  describe("when cache exists but expired", () => {
    const cacheData: CacheData = {
      lastCheckedAt: new Date("2023-07-13T00:00:00.000Z").getTime(),
      latestVersion: "0.0.0",
    };
    const currentTime = new Date("2023-07-13T12:00:00.000Z").getTime();

    beforeEach(() => {
      mockGetCacheData.mockReturnValue(cacheData);
      mockDateNow.mockReturnValue(currentTime);
      mockFetchLatestPackageVersion.mockResolvedValue("0.0.1");
      mockSetCacheData.mockReturnValue();
    });

    it("returns latest version and updates cache", async () => {
      expect(await getLatestPackageVersion()).toEqual("0.0.1");
      expect(mockGetCacheData).toBeCalled();
      expect(mockDateNow).toHaveBeenCalled();
      expect(mockFetchLatestPackageVersion).toHaveBeenCalled();
      expect(mockSetCacheData).toHaveBeenCalledWith({
        lastCheckedAt: currentTime,
        latestVersion: "0.0.1",
      });
    });
  });

  describe("when cache does not exist", () => {
    const currentTime = new Date("2023-07-13T12:00:00.000Z").getTime();

    beforeEach(() => {
      mockGetCacheData.mockReturnValue(null);
      mockDateNow.mockReturnValue(currentTime);
      mockFetchLatestPackageVersion.mockResolvedValue("0.0.1");
      mockSetCacheData.mockReturnValue();
    });

    it("returns latest version and updates cache", async () => {
      expect(await getLatestPackageVersion()).toEqual("0.0.1");
      expect(mockGetCacheData).toBeCalled();
      expect(mockDateNow).toHaveBeenCalled();
      expect(mockFetchLatestPackageVersion).toHaveBeenCalled();
      expect(mockSetCacheData).toHaveBeenCalledWith({
        lastCheckedAt: currentTime,
        latestVersion: "0.0.1",
      });
    });
  });
});
