import { createServer } from "node:http";
import path from "node:path";
import { startLocalChangeWatcher } from "./app";

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
