import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { uploadImageFile } from "../lib/upload-image";
import { upload } from "./upload";

jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/upload-image");

const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockUploadImageFile = jest.mocked(uploadImageFile);

describe("upload", () => {
  const qiitaApi = {} as Awaited<ReturnType<typeof getQiitaApiInstance>>;
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  it("prints the download URL of every uploaded image", async () => {
    mockUploadImageFile
      .mockResolvedValueOnce("https://image-store.example/first.png")
      .mockResolvedValueOnce("https://image-store.example/second.png");

    await upload(["first.png", "second.png"]);

    expect(mockUploadImageFile).toHaveBeenCalledWith({
      filePath: "first.png",
      qiitaApi,
    });
    expect(mockUploadImageFile).toHaveBeenCalledWith({
      filePath: "second.png",
      qiitaApi,
    });
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      "https://image-store.example/first.png",
    );
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      "https://image-store.example/second.png",
    );
  });

  it("requires at least one file", async () => {
    await upload([]);

    expect(mockUploadImageFile).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
