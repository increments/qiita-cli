import matter from "gray-matter";
import fs from "node:fs/promises";
import type { QiitaApi, Slide } from "../qiita-api";
import { QiitaSlide } from "./entities/qiita-slide";
import { SlideFileSystemRepo } from "./slide-file-system-repo";

jest.mock("node:fs/promises");

afterEach(() => {
  jest.resetAllMocks();
});

const dataRootDir = "data_root_dir";
const rootPath = `${dataRootDir}/slides`;
const remotePath = `${rootPath}/.remote`;

// `description` is null and the body has no trailing newline: both are
// normalized away when the markdown is rebuilt, so this file must still
// count as identical to the mirror below.
const localFile = `---
title: Title
id: slide-uuid
updated_at: '2026-09-01T00:00:00+09:00'
description: null
marp: true
---
# Title`;

const mirrorFile = `---
title: Title
id: slide-uuid
updated_at: '2026-09-01T00:00:00+09:00'
description: ''
marp: true
---
# Title
`;

const buildRemoteSlide = (overrides: Partial<Slide> = {}): Slide => ({
  uuid: "slide-uuid",
  title: "Title",
  markdown: "---\nmarp: true\n---\n# Title\n",
  description_markdown: "",
  created_at: "2026-09-01T00:00:00+09:00",
  updated_at: "2026-09-01T00:00:00+09:00",
  url: "https://qiita.com/Qiita/slides/slide-uuid",
  ...overrides,
});

const mockFileSystem = (files: Record<string, string>) => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  mockFs.readdir.mockImplementation(async (dirPath) => {
    const prefix = `${dirPath}/`;
    return Object.keys(files)
      .filter((filePath) => filePath.startsWith(prefix))
      .map((filePath) => filePath.slice(prefix.length)) as any[];
  });
  mockFs.readFile.mockImplementation(async (filePath) => {
    const content = files[filePath as string];
    if (content === undefined) {
      throw new Error(`ENOENT: ${filePath}`);
    }
    return content;
  });
  mockFs.writeFile.mockImplementation(async (filePath, data) => {
    files[filePath as string] = data as string;
  });
  return files;
};

const writtenPaths = () =>
  (fs as jest.Mocked<typeof fs>).writeFile.mock.calls.map((call) =>
    String(call[0]),
  );

const buildQiitaSlide = (
  overrides: Partial<ConstructorParameters<typeof QiitaSlide>[0]> = {},
) =>
  new QiitaSlide({
    id: null,
    title: "Title",
    description: null,
    rawBody: "# Title",
    updatedAt: null,
    name: "deck",
    slidesShowPath: "/slides/show?basename=deck",
    published: false,
    modified: true,
    isOlderThanRemote: false,
    slidePath: `${rootPath}/deck.md`,
    marpFrontmatter: { marp: true },
    ...overrides,
  });

const buildQiitaApi = () =>
  ({
    postSlide: jest.fn(),
    patchSlide: jest.fn(),
  }) as unknown as jest.Mocked<QiitaApi>;

describe("SlideFileSystemRepo", () => {
  describe("constructor", () => {
    it("creates", () => {
      const dataRootDir = "data_root_dir";
      const subject = () => {
        return new SlideFileSystemRepo({ dataRootDir });
      };
      expect(subject()).toBeInstanceOf(SlideFileSystemRepo);
    });
  });

  describe("getRootPath()", () => {
    it("returns the root path", () => {
      const dataRootDir = "./tmp";
      const instance = new SlideFileSystemRepo({ dataRootDir });
      expect(instance.getRootPath()).toBe(`tmp/slides`);
    });
  });

  describe("loadSlideByBasename()", () => {
    it("returns null when not found", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);

      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });
      const basename = "abc";

      return instance.loadSlideByBasename(basename).then((slide) => {
        expect(slide).toBeNull();
        expect(mockFs.readdir.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}`,
        );
      });
    });

    describe("when found slide", () => {
      it("returns unpublished slide when id is null", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "slides";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const basename = "abc";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        mockFs.readFile.mockResolvedValue(`---
title: Title
id: null
description: null
---
# Title`);

        return instance.loadSlideByBasename(basename).then((slide) => {
          expect(slide?.id).toBeNull();
          expect(slide?.published).toBe(false);
          expect(slide?.title).toBe("Title");
          expect(slide?.slidesShowPath).toBe(
            `/slides/show?basename=${basename}`,
          );
          expect(mockFs.readFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/${basename}.md`,
          );
        });
      });

      it("forwards arbitrary marp frontmatter (beyond theme) to the slide markdown", () => {
        const dataRootDir = "data_root_dir";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const basename = "abc";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        mockFs.readFile.mockResolvedValue(`---
title: Title
id: null
description: null
theme: gaia
paginate: true
---
# Title`);

        return instance.loadSlideByBasename(basename).then((slide) => {
          const { data, content } = matter(slide!.toMarkdown());
          expect(data).toStrictEqual({ theme: "gaia", paginate: true });
          expect(content.trim()).toBe("# Title");
        });
      });

      it("returns published slide when id is present", () => {
        const dataRootDir = "data_root_dir";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const basename = "abc";
        const id = "this_is_id";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        mockFs.readFile.mockResolvedValue(`---
title: Title
id: ${id}
description: null
---
# Title`);

        return instance.loadSlideByBasename(basename).then((slide) => {
          expect(slide?.id).toBe(id);
          expect(slide?.published).toBe(true);
          expect(slide?.slidesShowPath).toBe(`/slides/${id}`);
        });
      });
    });
  });

  describe("loadSlideById()", () => {
    it("returns null when not found", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);

      const instance = new SlideFileSystemRepo({
        dataRootDir: "data_root_dir",
      });

      return instance.loadSlideById("missing-id").then((slide) => {
        expect(slide).toBeNull();
      });
    });

    describe("when found slide", () => {
      it("returns the slide matching the id", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "slides";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const id = "this_is_id";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}`:
              return ["deck-a.md", "deck-b.md"] as any[];
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });
        mockFs.readFile.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}/deck-a.md`:
              return `---\ntitle: A\nid: other-id\ndescription: null\n---\nbody a`;
            case `${dataRootDir}/${subDir}/deck-b.md`:
              return `---\ntitle: B\nid: ${id}\ndescription: null\n---\nbody b`;
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });

        return instance.loadSlideById(id).then((slide) => {
          expect(slide?.name).toBe("deck-b");
          expect(slide?.id).toBe(id);
        });
      });
    });
  });

  describe("loadSlides()", () => {
    it("returns empty when no slides exist", () => {
      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockImplementation(async (path) => {
        switch (path) {
          case `${dataRootDir}/${subDir}`:
            return [];
          default:
            throw new Error(`Unexpected path: ${path}`);
        }
      });

      return instance.loadSlides().then((slides) => {
        expect(slides).toStrictEqual([]);
      });
    });

    it("returns all slides", () => {
      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockImplementation(async (path) => {
        switch (path) {
          case `${dataRootDir}/${subDir}`:
            return ["deck-a.md", "deck-b.md"] as any[];
          default:
            throw new Error(`Unexpected path: ${path}`);
        }
      });
      mockFs.readFile.mockImplementation(async (path) => {
        switch (path) {
          case `${dataRootDir}/${subDir}/deck-a.md`:
            return `---\ntitle: A\nid: id-a\ndescription: null\n---\nbody a`;
          case `${dataRootDir}/${subDir}/deck-b.md`:
            return `---\ntitle: B\nid: id-b\ndescription: null\n---\nbody b`;
          default:
            throw new Error(`Unexpected path: ${path}`);
        }
      });

      return instance.loadSlides().then((slides) => {
        expect(slides.map((slide) => slide.id)).toStrictEqual(["id-a", "id-b"]);
      });
    });
  });

  describe("createSlide()", () => {
    it("saves slide with a default basename when basename is not given", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      // createSlide() reads the directory twice: once to pick a free
      // basename and once to check the basename is not taken.
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValueOnce();

      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      return instance.createSlide().then(() => {
        expect(mockFs.writeFile.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}/newSlide001.md`,
        );
        const { data } = matter(mockFs.writeFile.mock.calls[0][1] as string);
        expect(data.id).toBeNull();
      });
    });

    it("saves slide with the given basename", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);
      mockFs.writeFile.mockResolvedValueOnce();

      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      return instance.createSlide("deck").then(() => {
        expect(mockFs.writeFile.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}/deck.md`,
        );
      });
    });
  });

  describe("updateSlideFrontmatter()", () => {
    it("writes back id and updated_at while keeping the marp directives", () => {
      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });
      const basename = "deck";

      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValue([`${basename}.md`] as any[]);
      mockFs.readFile.mockResolvedValue(`---
title: Title
id: null
description: null
marp: true
theme: gaia
---
body`);
      mockFs.writeFile.mockResolvedValueOnce();

      return instance
        .updateSlideFrontmatter(basename, {
          id: "new-id",
          updatedAt: "2026-08-24T00:00:00+09:00",
        })
        .then(() => {
          expect(mockFs.writeFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/${basename}.md`,
          );
          const { data, content } = matter(
            mockFs.writeFile.mock.calls[0][1] as string,
          );
          expect(data.id).toBe("new-id");
          expect(data.updated_at).toBe("2026-08-24T00:00:00+09:00");
          expect(data.marp).toBe(true);
          expect(data.theme).toBe("gaia");
          expect(content.trim()).toBe("body");
        });
    });
  });

  describe("loadPublishTargets()", () => {
    it("returns the unpublished slides and the ones that differ from the mirror", async () => {
      mockFileSystem({
        [`${rootPath}/draft.md`]: localFile.replace(
          "id: slide-uuid",
          "id: null",
        ),
        [`${rootPath}/edited.md`]: localFile.replace("# Title", "# Edited"),
        [`${remotePath}/slide-uuid.md`]: mirrorFile,
        [`${rootPath}/synced.md`]: localFile,
      });
      const instance = new SlideFileSystemRepo({ dataRootDir });

      const targets = await instance.loadPublishTargets();

      expect(targets.map((slide) => slide.name).sort()).toStrictEqual([
        "draft",
        "edited",
      ]);
    });
  });

  describe("publishSlide()", () => {
    describe("when the slide has no id yet", () => {
      it("posts it, writes the uuid back and then refreshes the mirror", async () => {
        const files = mockFileSystem({
          [`${rootPath}/deck.md`]: `---
title: Title
id: null
updated_at: null
description: null
marp: true
---
# Title
`,
        });
        const qiitaApi = buildQiitaApi();
        const responseSlide = buildRemoteSlide();
        qiitaApi.postSlide.mockResolvedValue(responseSlide);
        const instance = new SlideFileSystemRepo({ dataRootDir });

        const result = await instance.publishSlide(buildQiitaSlide(), qiitaApi);

        expect(qiitaApi.postSlide).toHaveBeenCalledWith({
          title: "Title",
          markdown: "---\nmarp: true\n---\n# Title\n",
          description: "",
        });
        expect(qiitaApi.patchSlide).not.toHaveBeenCalled();
        expect(result).toStrictEqual({ slide: responseSlide, posted: true });
        // The uuid reaches the local file before the mirror is refreshed, so
        // the sync updates deck.md instead of creating a second slide file.
        expect(writtenPaths()).toStrictEqual([
          `${rootPath}/deck.md`,
          `${remotePath}/slide-uuid.md`,
          `${rootPath}/deck.md`,
        ]);
        expect(Object.keys(files).sort()).toStrictEqual([
          `${remotePath}/slide-uuid.md`,
          `${rootPath}/deck.md`,
        ]);
        expect(matter(files[`${rootPath}/deck.md`]).data.id).toBe("slide-uuid");
      });

      it("normalizes a null description to an empty string", async () => {
        mockFileSystem({ [`${rootPath}/deck.md`]: localFile });
        const qiitaApi = buildQiitaApi();
        qiitaApi.postSlide.mockResolvedValue(buildRemoteSlide());
        const instance = new SlideFileSystemRepo({ dataRootDir });

        await instance.publishSlide(
          buildQiitaSlide({ description: null }),
          qiitaApi,
        );

        expect(qiitaApi.postSlide).toHaveBeenCalledWith(
          expect.objectContaining({ description: "" }),
        );
      });
    });

    describe("when the slide already has an id", () => {
      it("patches it and refreshes the mirror without rewriting the uuid", async () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const qiitaApi = buildQiitaApi();
        const responseSlide = buildRemoteSlide();
        qiitaApi.patchSlide.mockResolvedValue(responseSlide);
        const instance = new SlideFileSystemRepo({ dataRootDir });

        const result = await instance.publishSlide(
          buildQiitaSlide({
            id: "slide-uuid",
            published: true,
            description: "An example description",
          }),
          qiitaApi,
        );

        expect(qiitaApi.patchSlide).toHaveBeenCalledWith({
          uuid: "slide-uuid",
          title: "Title",
          markdown: "---\nmarp: true\n---\n# Title\n",
          description: "An example description",
        });
        expect(qiitaApi.postSlide).not.toHaveBeenCalled();
        expect(result).toStrictEqual({ slide: responseSlide, posted: false });
        expect(writtenPaths()).toStrictEqual([
          `${remotePath}/slide-uuid.md`,
          `${rootPath}/deck.md`,
        ]);
      });
    });
  });

  describe("with the .remote mirror", () => {
    describe("loadSlides()", () => {
      it("excludes the mirrored files from the slide list", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlides().then((slides) => {
          expect(slides.map((slide) => slide.name)).toStrictEqual(["deck"]);
        });
      });
    });

    describe("loadSlideByBasename()", () => {
      it("reports no diff when the local slide matches the mirror", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.modified).toBe(false);
          expect(slide?.isOlderThanRemote).toBe(false);
        });
      });

      it("reports a diff when the local body differs from the mirror", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace("# Title", "# Edited"),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.modified).toBe(true);
        });
      });

      it("reports a diff when a marp directive differs from the mirror", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace(
            "marp: true",
            "marp: true\ntheme: gaia",
          ),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.modified).toBe(true);
        });
      });

      it("reports being older than the remote when the mirror is newer", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile.replace(
            "2026-09-01",
            "2026-09-02",
          ),
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.isOlderThanRemote).toBe(true);
        });
      });
    });

    describe("saveSlides()", () => {
      it("updates both the mirror and the local file when they match", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance
          .saveSlides([buildRemoteSlide({ title: "Renamed" })])
          .then(() => {
            expect(writtenPaths()).toStrictEqual([
              `${remotePath}/slide-uuid.md`,
              `${rootPath}/deck.md`,
            ]);
          });
      });

      it("updates only the mirror when the local file has local edits", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace("# Title", "# Edited"),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.saveSlides([buildRemoteSlide()]).then(() => {
          expect(writtenPaths()).toStrictEqual([`${remotePath}/slide-uuid.md`]);
        });
      });

      it("overwrites the local edits when forceUpdate is given", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace("# Title", "# Edited"),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.saveSlides([buildRemoteSlide()], true).then(() => {
          expect(writtenPaths()).toStrictEqual([
            `${remotePath}/slide-uuid.md`,
            `${rootPath}/deck.md`,
          ]);
        });
      });

      it("names a slide that has no local file after its uuid", () => {
        mockFileSystem({});
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.saveSlides([buildRemoteSlide()]).then(() => {
          expect(writtenPaths()).toStrictEqual([
            `${remotePath}/slide-uuid.md`,
            `${rootPath}/slide-uuid.md`,
          ]);
        });
      });
    });
  });
});
