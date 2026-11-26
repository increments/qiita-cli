import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { config } from "../lib/config";
import { startLocalChangeWatcher, startServer } from "./app";

jest.mock("../lib/config");

const mockGetUserConfig = jest.mocked(config.getUserConfig);
const mockWatch = jest.fn();

// chokidar is ESM-only; stub it so the dynamic import() works under ts-jest's
// CommonJS transform.
jest.mock(
  "chokidar",
  () => ({
    __esModule: true,
    default: { watch: (...args: unknown[]) => mockWatch(...args) },
  }),
  { virtual: true },
);

describe("startLocalChangeWatcher", () => {
  beforeEach(() => {
    mockWatch.mockReset();
    mockWatch.mockReturnValue({ on: jest.fn() });
  });

  const getIgnored = async (watchPaths: string | string[]) => {
    await startLocalChangeWatcher({ server: createServer(), watchPaths });
    return mockWatch.mock.calls[0][1].ignored as (string | RegExp)[];
  };

  it("ignores the .remote directory of the watched path", async () => {
    const rootDir = path.join("/data", "public");

    expect(await getIgnored(rootDir)).toContain(path.join(rootDir, ".remote"));
  });

  it("ignores the .remote directory of each watched path", async () => {
    const rootDirs = [path.join("/a", "public"), path.join("/b", "public")];

    expect(await getIgnored(rootDirs)).toEqual(
      expect.arrayContaining(rootDirs.map((p) => path.join(p, ".remote"))),
    );
  });

  // chokidar v4+ compares string matchers with the whole path, so a glob
  // such as "**/.remote/**" never matches.
  it("does not pass globs", async () => {
    const ignored = await getIgnored(path.join("/data", "public"));

    expect(
      ignored.filter((m) => typeof m === "string" && m.includes("*")),
    ).toEqual([]);
  });
});

describe("startServer", () => {
  let server: Server;

  beforeEach(() => {
    mockGetUserConfig.mockResolvedValue({
      includePrivate: false,
      host: "127.0.0.1",
      port: 0,
    });
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const baseUrlOf = (server: Server) =>
    `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  it("accepts image uploads while the slide feature is unavailable", async () => {
    server = await startServer({ slideFeatureAvailable: false });

    const response = await fetch(`${baseUrlOf(server)}/api/images`, {
      method: "POST",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "画像のファイル名が指定されていません",
    });
  });
});
